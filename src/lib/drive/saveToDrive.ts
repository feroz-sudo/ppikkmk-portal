// NOTE: To securely use Google Drive API via REST without external libraries,
// we utilize the accessToken provided by Firebase Google Sign-In.

// Helper to find or create a specific folder in Google Drive
const getOrCreateFolder = async (accessToken: string, folderName: string, parentId?: string): Promise<string> => {
    let q = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentId) {
        q += ` and '${parentId}' in parents`;
    }

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
        return data.files[0].id;
    }

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : []
        })
    });

    if (!createRes.ok) {
        throw new Error(`Failed to create folder ${folderName}: ${createRes.statusText}`);
    }

    const createData = await createRes.json();
    return createData.id;
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
 */
export const buildClinicalId = (
    programType: 'practicum' | 'internship' | null,
    clientType: 'KI' | 'KK',
    matricNumber: string
): string => {
    const prefix = programType === 'internship' ? 'I' : 'P';

    // Normalize the trainee identifier
    let traineePart = matricNumber || 'UNKNOWN';
    traineePart = traineePart.toUpperCase();

    // The standardized format for PPIKKMK: [P/I][KI/KK]-[MATRIC]
    // Example: PKI-M20241001148
    return `${prefix}${clientType}-${traineePart}`;
};

/**
 * Uploads a PDF to Google Drive following the strict 3-layer clinical folder structure.
 *
 * Folder path : [ClinicalID] / [ClientID] / [SessionID]
 * File name   : [ClinicalID]_[ClientID]_[SessionID].pdf
 *
 * Example: PKIM20241001148/001/01 → PKIM20241001148_001_01.pdf
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

        // Example Filename: PKI-M20241001148-C001-S01.pdf
        const fileName = `${clinicalId}-C${paddedClientId}-S${paddedSessionId}.pdf`;
        const folderNames = [clinicalId, paddedClientId, paddedSessionId];
        let currentParentId: string | undefined = undefined;

        for (const folderName of folderNames) {
            currentParentId = await getOrCreateFolder(accessToken, folderName, currentParentId);
        }

        const metadata = {
            name: fileName,
            mimeType: 'application/pdf',
            parents: currentParentId ? [currentParentId] : [],
            description: 'Auto-generated Clinical Session Report'
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', pdfBlob);

        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: form
        });

        if (!res.ok) {
            throw new Error(`Drive Upload Failed: ${res.statusText}`);
        }

        const data = await res.json();
        return data.id;

    } catch (error) {
        console.error("Google Drive API Error:", error);
        throw error;
    }
};
