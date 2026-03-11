// NOTE: To securely use Google Drive API via REST without external libraries,
// we utilize the accessToken provided by Firebase Google Sign-In.

// Helper to find or create a specific folder in Google Drive
const getOrCreateFolder = async (accessToken: string, folderName: string, parentId?: string): Promise<string> => {
    // Search for existing folder
    let q = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentId) {
        q += ` and '${parentId}' in parents`;
    } else {
        q += ` and 'root' in parents`; // Ensure root folders are searched in My Drive
    }

    console.log(`[Drive] Searching for folder: "${folderName}" ${parentId ? `under parent: ${parentId}` : "in root"}`);

    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!searchRes.ok) {
        if (searchRes.status === 401) {
            throw new Error("UNAUTHORIZED_DRIVE_ACCESS");
        }
        const errText = await searchRes.text();
        throw new Error(`Drive folder search failed (${searchRes.status}): ${errText}`);
    }

    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
        const foundId = data.files[0].id;
        console.log(`[Drive] Found existing folder: "${folderName}" with ID: ${foundId}`);
        return foundId;
    }

    // Create if not found
    console.log(`[Drive] Folder "${folderName}" not found. Creating...`);
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : ['root'] // Explicitly use root
        })
    });

    if (!createRes.ok) {
        const errText = await createRes.text();
        console.error(`[Drive] Create failed for ${folderName}:`, errText);
        throw new Error(`Failed to create folder ${folderName}: ${createRes.status} - ${errText}`);
    }

    const createData = await createRes.json();
    console.log(`[Drive] Created folder: "${folderName}" with ID: ${createData.id}`);
    return createData.id;
};

/**
 * Helper to extract matric number from UPSI student email.
 * e.g. m20241001148@siswa.upsi.edu.my -> M20241001148
 */
export const extractMatricFromEmail = (email: string | null | undefined): string => {
    if (!email || !email.includes('@siswa.upsi.edu.my')) return "";
    return email.split('@')[0].toUpperCase();
};

/**
 * Builds the canonical Clinical File ID used for both folder hierarchy and file naming.
 *
 * Format  : [TypePrefix][ClientType][TraineeID]
 * Examples: PKIM20241001148  (Practicum + Individual + M-number)
 *           IKKM20241001148  (Internship + Group + M-number)
 *
 * @param programType  'practicum' | 'internship' | null  → prefix P or I
 * @param clientType   'KI' | 'KK'
 * @param matricNumber e.g. 'M20241001148'
 * @param email        Optional email to fallback if matricNumber is empty
 */
export const buildClinicalId = (
    programType: 'practicum' | 'internship' | null,
    clientType: 'KI' | 'KK',
    matricNumber: string,
    email?: string
): string => {
    const prefix = programType === 'internship' ? 'I' : 'P';
    
    // Normalize the trainee identifier
    let traineePart = matricNumber || extractMatricFromEmail(email) || 'UNKNOWN';
    traineePart = traineePart.toUpperCase();

    // The standardized format for PPIKKMK: [P/I][KI/KK][MATRIC]
    // Example: PKIM20241001148
    return `${prefix}${clientType}${traineePart}`;
};

/**
 * Initializes the 2-layer folder structure in Google Drive during client registration.
 * Path: [ClinicalID]_[ClientID] / 01
 * 
 * @param accessToken Google OAuth2 token
 * @param clinicalId  e.g. PKIM20241001148
 * @param clientId    e.g. '001'
 */
export const initializeClientFolders = async (
    accessToken: string,
    clinicalId: string,
    clientId: string
) => {
    try {
        const paddedClientId = clientId.padStart(3, '0');
        // Layer 1: [ClinicalID]_[ClientID] (e.g. PKIM20241022134_001)
        const mainFolderName = `${clinicalId}_${paddedClientId}`;
        // Layer 2: Initial session folder (01)
        const subFolderName = '01';

        console.log(`[Drive] Initializing folders for ${mainFolderName}/${subFolderName}...`);
        
        const mainFolderId = await getOrCreateFolder(accessToken, mainFolderName);
        const subFolderId = await getOrCreateFolder(accessToken, subFolderName, mainFolderId);

        return subFolderId;
    } catch (error) {
        console.error("Folder Initialization Error:", error);
        throw error;
    }
};

/**
 * Uploads a PDF to Google Drive following the 2-layer clinical folder structure.
 *
 * Folder path : [ClinicalID]_[ClientID] / [SessionID]
 * File name   : [ClinicalID]_[ClientID]_[SessionID].pdf
 *
 * Example: PKIM20241001148_001/01 → PKIM20241001148_001_01.pdf
 *
 * @param accessToken  Google OAuth2 token
 * @param pdfBlob      Generated PDF blob
 * @param clinicalId   Composite ID from buildClinicalId(), e.g. PKIM20241001148
 * @param clientId     Numeric client code, e.g. '001'
 * @param sessionId    Session identifier, e.g. '01'
 */
export const uploadToGoogleDrive = async (
    accessToken: string,
    pdfBlob: Blob,
    clinicalId: string,
    clientId: string,
    sessionId: string
) => {
    try {
        // Enforce padding for path and filename consistency
        const paddedClientId = clientId.padStart(3, '0');
        const paddedSessionId = sessionId.padStart(2, '0');

        // Example Filename: PKIM20241001148_001_01.pdf
        const fileName = `${clinicalId}_${paddedClientId}_${paddedSessionId}.pdf`;
        
        // 2-Layer Folder Structure
        const mainFolderName = `${clinicalId}_${paddedClientId}`;
        const subFolderName = paddedSessionId;

        console.log(`[Drive] Navigating to folder: ${mainFolderName}/${subFolderName} for upload...`);
        
        const mainFolderId = await getOrCreateFolder(accessToken, mainFolderName);
        const subFolderId = await getOrCreateFolder(accessToken, subFolderName, mainFolderId);

        const metadata = {
            name: fileName,
            mimeType: 'application/pdf',
            parents: [subFolderId],
            description: 'Auto-generated Clinical Session Report'
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', pdfBlob);

        console.log(`[Drive] Uploading ${fileName} to Google Drive...`);
        
        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: form
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Drive Upload Failed (${res.status}): ${errText}`);
        }

        const data = await res.json();
        console.log(`[Drive] Upload successful! File ID: ${data.id}`);
        return data.id;

    } catch (error) {
        console.error("Google Drive API Error:", error);
        throw error;
    }
};
