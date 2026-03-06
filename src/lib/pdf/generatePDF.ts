import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Session, Client } from '../firebase/db';

export const generateSessionPDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Strict Arial Font requirement
    doc.setFont('helvetica', 'bold'); // jsPDF default closest to Arial

    // Header: UPSI Branding Placeholders (Full Color)
    try {
        const logoRes = await fetch('/upsi-logo.png');
        const buffer = await logoRes.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) { binary += String.fromCharCode(bytes[i]); }
        const base64 = window.btoa(binary);
        doc.addImage(`data:image/png;base64,${base64}`, 'PNG', 15, 12, 45, 20);

    } catch (e) {
        console.warn("Could not load logos for PDF", e);
    }

    const TITLES: Record<string, string> = {
        Form1: 'PSYCHOLOGICAL INTAKE REPORT',
        Form2: 'PROGRESSIVE NOTES',
        Form3: 'CASE CONCEPTUALISATION',
        Form4: 'CLINICAL TREATMENT PLAN',
        Form5: 'TERMINATION OF COUNSELLING SESSION',
        Form6: 'CRISIS INTERVENTION REPORT',
        Form7: 'CONSULTATION REPORT',
        Form8: 'PSYCHOLOGICAL FIRST AID/ MENTAL HEALTH & PSYCHOSOCIAL SUPPORT REPORT',
        Form11: 'GROUP COUNSELLING REPORT',
        Form13: 'CLINICAL ASSESSMENT REPORT'
    };

    const REF_CODES: Record<string, string> = {
        Form1: 'Psychological_Intake_Report/KKMK_UPSI/01-2025',
        Form2: 'Progressive_Notes/KKMK_UPSI/02-2025',
        Form3: 'Case_Conceptualisation/KKMK_UPSI/03-2025',
        Form4: 'Clinical_Treatment_Plan/KKMK_UPSI/04-2025',
        Form5: 'Termination_Session/KKMK_UPSI/05-2025',
        Form6: 'Crisis_Intervention_Report/KKMK_UPSI/06-2025',
        Form7: 'Consultation_Report/KKMK_UPSI/07-2025',
        Form8: 'PFA/MHPSS_Report/KKMK_UPSI/08-2025',
        Form11: 'Group_Counselling_Report/KKMK_UPSI/11-2025',
        Form13: 'Clinical_Assessment_Report/KKMK_UPSI/13-2025'
    };

    const LABEL_MAPPING: Record<string, string> = {
        consultantName: 'Name',
        institution: 'Institution',
        clientName: 'Client\'s Name',
        guardiansName: 'Guardian\'s Name',
        dateTime: 'Date & Time',
        venue: 'Venue',
        attendanceType: 'Attendance Type',
        issuesDiscussed: 'Issue (s) Discussed',
        interventionActions: 'Intervention / Resolution Actions',
        followUp: 'Follow-Up',
        referralNeeded: 'Referral Needed',
        referralSpecifics: 'Referral (If necessary, please specify):',
        counsellorName: 'Counsellor Trainee',
        programName: 'PFA / MHPSS Activity Name',
        participantsCount: 'Number of Clients Attending',
        speakerProvider: 'Speaker / Provider',
        collaborators: 'Collaborator (s)',
        objectives: 'Objectives of the Program / Session',
        identifiedIssues: 'Identified Issue (s)',
        activitiesInterventions: 'Activities / Interventions Delivered'
    };

    // --- PDF Branding & Headers Rendering ---
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    const formTitle = TITLES[session.formType] || `${session.formType.toUpperCase()} REPORT`;

    // Split title if it's too long
    const splitTitle = doc.splitTextToSize(formTitle, 90);
    // Position title centered in the available space (leaving room for logo on left)
    // Logo is at X=15, Width=45 (ends at 60). Page width is 210. 
    // Remaining space 60 to 210 is 150. Center of that space is 60 + 75 = 135.
    doc.text(splitTitle, 130, 20, { align: 'center' });
    const titleHeight = (splitTitle.length - 1) * 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PRAKTIKUM & INTERNSHIP', 130, 28 + titleHeight, { align: 'center' });
    doc.text('KAUNSELING (KESIHATAN MENTAL KLINIKAL)', 130, 34 + titleHeight, { align: 'center' });
    doc.text('UNIVERSITI PENDIDIKAN SULTAN IDRIS', 130, 40 + titleHeight, { align: 'center' });

    // Clinical File ID
    if (clinicalId) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 128);
        doc.text(`CLINICAL FILE ID: ${clinicalId}`, 130, 12, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    // Client Demographics Table (Header Fallbacks)
    const renderStr = (val: any) => val !== undefined && val !== null && val !== "" ? String(val) : "N/A";

    // Fix Firebase Timestamp Invalid Date Issue
    let formattedDate = "N/A";
    if (session.date) {
        if (session.date instanceof Object && 'seconds' in session.date) {
            formattedDate = new Date((session.date as any).seconds * 1000).toLocaleDateString();
        } else {
            formattedDate = new Date(session.date as any).toLocaleDateString();
        }
    }

    const headerBody = [];
    if (session.formData && session.formData.personalData) {
        // Form 1 (or any form with Personal Data) already captures Date, Session Number, etc. inside it.
        headerBody.push(['Client File Number:', renderStr(client.demographics.name)]);
    } else {
        // Forms without Personal Data (like Form 2) need these details at the top.
        headerBody.push(['Client File Number:', renderStr(client.demographics.name), 'Date:', formattedDate]);
        headerBody.push(['Session Number:', renderStr(session.sessionId), 'Duration:', `${renderStr(session.duration)} hrs`]);
    }

    autoTable(doc, {
        startY: 40,
        theme: 'plain',
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 2 },
        body: headerBody,
    });

    // Form Data Rendering (Dynamic Support for All 10 Forms)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let yPos = (doc as any).lastAutoTable.finalY + 10;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
    };

    const addSection = (title: string, content: string | Record<string, any>) => {
        let displayTitle = title.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // Convert camelCase to Title Case
        if (title === 'sessionDateTime') displayTitle = 'Session Date & Time';

        checkPageBreak(15);
        doc.setFont('helvetica', 'bold');
        doc.text(displayTitle.toUpperCase(), 15, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 6;

        if (typeof content === 'object' && content !== null) {
            // Render nested objects as sub-tables (e.g., personalData in Form 1)
            const tableBody = Object.entries(content).map(([k, v]) => {
                let rowLabel = LABEL_MAPPING[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                if (k === 'sessionDateTime') rowLabel = 'Session Date & Time';
                return [rowLabel, renderStr(v)];
            });

            autoTable(doc, {
                startY: yPos,
                theme: 'grid',
                styles: { font: 'helvetica', fontSize: 9, cellPadding: 2 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 130 } },
                body: tableBody,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            yPos = (doc as any).lastAutoTable.finalY + 8;
        } else {
            // Render standard narrative strings
            const strContent = renderStr(content);
            const splitText = doc.splitTextToSize(strContent, 180);
            checkPageBreak(splitText.length * 5 + 4);
            doc.text(splitText, 15, yPos);
            yPos += (splitText.length * 5) + 8;
        }
    };

    if (session.formData) {
        // Automatically iterate all roots of formData, putting objects (like personalData) first, then long naratives
        const entries = Object.entries(session.formData);

        // Render Objects first
        entries.filter(e => typeof e[1] === 'object').forEach(([k, v]) => addSection(k, v as Record<string, any>));

        // Render Strings next
        entries.filter(e => typeof e[1] !== 'object').forEach(([k, v]) => addSection(k, String(v)));
    }

    // Official Signature Block
    checkPageBreak(60);
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    const drawSignatureRow = (label: string, name: string) => {
        checkPageBreak(30);
        doc.setFont('helvetica', 'bold');
        doc.text(label, 15, yPos);
        yPos += 12;

        const lineXStart = 15;
        const lineXEnd = 95;

        // Dotted Line
        doc.setLineDashPattern([0.5, 0.5], 0);
        doc.setLineWidth(0.4);
        doc.line(lineXStart, yPos, lineXEnd, yPos);
        doc.setLineDashPattern([], 0); // Reset

        yPos += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("(", lineXStart, yPos);
        doc.text(")", lineXEnd - 2, yPos);

        if (name) {
            const midPoint = lineXStart + ((lineXEnd - lineXStart) / 2);
            doc.text(name.toUpperCase(), midPoint, yPos, { align: 'center' });
        }
        yPos += 12;
    };

    // Special Handling for Multi-Signature Forms (7 & 8)
    if (session.formType === 'Form7' || session.formType === 'Form8') {
        const data = session.formData?.signatures || session.formData || {};

        checkPageBreak(60);
        autoTable(doc, {
            startY: yPos,
            theme: 'grid',
            head: [['Action', 'Signature & Name']],
            headStyles: { fillColor: [0, 0, 128], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            body: [
                [
                    'DD/MM/YYYY',
                    '..................................................\n(' + (data.traineeSignature || '').toUpperCase() + ')'
                ],
                [
                    'DD/MM/YYYY',
                    '..................................................\n(' + (data.siteSupervisorSignature || '').toUpperCase() + ')'
                ],
                [
                    'DD/MM/YYYY',
                    '..................................................\n(' + (data.academicSupervisorSignature || '').toUpperCase() + ')'
                ]
            ],
            styles: { font: 'helvetica', fontSize: 9, minCellHeight: 25, valign: 'bottom', halign: 'center' },
            columnStyles: {
                0: { cellWidth: 40, fontStyle: 'normal', halign: 'center', valign: 'middle', textColor: [150, 150, 150] },
                1: { cellWidth: 140 }
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
        // Standard Single Signature (Forms 1, 2, 3, 4, 5, 6, 11, 13)
        const name = session.formData?.counsellorName || session.formData?.traineeSignature || session.formData?.counselorNameSignature || "";
        drawSignatureRow("Report by:", name);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("CMCH Counselor Trainee", 15, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 6;
        doc.text("Universiti Pendidikan Sultan Idris", 15, yPos);
        yPos += 6;
        doc.text("35900 Tanjong Malim, Perak", 15, yPos);
    }

    // --- APPENDICES SECTION (Form 8 Special) ---
    if (session.formData && session.formData.appendices && Array.isArray(session.formData.appendices) && session.formData.appendices.length > 0) {
        doc.addPage();
        yPos = 20;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text("APPENDICES", 105, yPos, { align: 'center' });
        yPos += 15;

        for (const appendix of session.formData.appendices) {
            try {
                // appendix.url is base64 string
                const imgData = appendix.url;
                const widthPercent = appendix.widthPercent || 100;
                const caption = appendix.caption || "";

                // Calculate dimensions
                const maxWidth = 180; // Adjusted for margins
                const imgWidth = (maxWidth * widthPercent) / 100;

                // We need to get image aspect ratio to determine height
                // Since base64 image doesn't give us width/height directly in jsPDF without rendering or external lib,
                // we'll use a standard height estimation or try to add it with a high auto height.
                // Better approach: use addImage with 'FAST' and a calculated height.

                // For simplicity in this env, we'll use a fixed ratio or assume landscape if no info.
                // However, jsPDF addImage can automatically handle the height if we pass 0 or undefined.
                // Let's test if passing 0 for height works for aspect ratio.

                const estimatedHeight = 80; // Fallback
                checkPageBreak(estimatedHeight + 15);

                const xOffset = 105 - (imgWidth / 2); // Center image based on width

                doc.addImage(imgData, 'JPEG', xOffset, yPos, imgWidth, 0); // 0 height for auto aspect ratio

                // Get the actual rendered height if possible (jsPDF doesn't return it easily, but we can estimate)
                // A safer way is to check the yPos after addImage.
                // Since jsPDF doesn't update yPos automatically for addImage, we increment based on an assumption or a standard block.
                yPos += 90; // Approximate image height + spacing

                if (caption) {
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(10);
                    const splitCaption = doc.splitTextToSize(`Figure: ${caption}`, 170);
                    doc.text(splitCaption, 105, yPos, { align: 'center' });
                    yPos += (splitCaption.length * 5) + 15;
                } else {
                    yPos += 10;
                }

            } catch (err) {
                console.error("Error adding appendix image to PDF", err);
            }
        }
    }

    // Confidential Footer - Centered at Bottom
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(112, 128, 144); // Slate Grayish
    // A4 dimensions: 210 x 297mm. So bottom center is roughly (105, 285)
    // Add to all pages by looping
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Header: Unique Reference Code (Top-Right)
        const refCode = REF_CODES[session.formType];
        if (refCode) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(0, 0, 0); // Ensure black
            doc.text(refCode, 195, 10, { align: 'right' });
        }

        // Footer: Confidentiality Statement (Bottom-Center)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(112, 128, 144); // Slate Grayish
        doc.text("CONFIDENTIAL DOCUMENT (FOR PROFESSIONAL USE ONLY)", 105, 285, { align: 'center' });
    }

    return doc.output('blob');
};
