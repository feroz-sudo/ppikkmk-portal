import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Session, Client } from '../firebase/db';

export const generateSessionPDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    if (session.formType === 'Form1') {
        return generateForm1PDF(session, client, clinicalId);
    }
    if (session.formType === 'Form2') {
        return generateForm2PDF(session, client, clinicalId);
    }
    if (session.formType === 'Form3') {
        return generateForm3PDF(session, client, clinicalId);
    }
    if (session.formType === 'Form4') {
        return generateForm4PDF(session, client, clinicalId);
    }
    if (session.formType === 'Form5') {
        return generateForm5PDF(session, client, clinicalId);
    }
    if (session.formType === 'Form6') {
        return generateForm6PDF(session, client, clinicalId);
    }
    if (session.formType === 'Form7') {
        return generateForm7PDF(session, client, clinicalId);
    }
    if (session.formType === 'Form8') {
        return generateForm8PDF(session, client, clinicalId);
    }
    if (session.formType === 'Form13') {
        return generateForm13PDF(session, client, clinicalId);
    }
    if (session.formType === 'Form11') {
        return generateForm11PDF(session, client, clinicalId);
    }
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
        Form3: 'CASE CONCEPTUALIZATION',
        Form4: 'TREATMENT PLANNING',
        Form5: 'TERMINATION SESSION',
        Form6: 'CRISIS INTERVENTION REPORT',
        Form7: 'CONSULTATION REPORT',
        Form8: 'PFA MHPSS REPORT',
        Form11: 'GROUP COUNSELING REPORT',
        Form13: 'PSYCHOLOGICAL ASSESSMENT REPORT'
    };

    const REF_CODES: Record<string, string> = {
        Form1: 'Psychological_Intake_Report/KKMK_UPSI/01-2025',
        Form2: 'Progressive_Notes/KKMK_UPSI/02-2025',
        Form3: 'Case_Conceptualisation/KKMK_UPSI/03-2025',
        Form4: 'Treatment_Planning/KKMK_UPSI/04-2025',
        Form5: 'Termination_Session/KKMK_UPSI/05-2025',
        Form6: 'Crisis_Intervention_Report/KKMK_UPSI/06-2025',
        Form7: 'Consultation_Report/KKMK_UPSI/07-2025',
        Form8: 'PFA_MHPSS_Report/KKMK_UPSI/08-2025',
        Form11: 'Group_Counseling_Report/CMHC_UPSI/11-2025',
        Form13: 'Psychological_Assessment_Report/KKMK_UPSI/13-2025'
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
    const formTitle = TITLES[session.formType as keyof typeof TITLES] || `${(session.formType as string).toUpperCase()} REPORT`;

    // Split title if it's too long
    const splitTitle = doc.splitTextToSize(formTitle, 90);
    // Position title centered in the available space (leaving room for logo on left)
    doc.text(splitTitle, 130, 22, { align: 'center' }); // Lowered slightly from 20
    const titleLines = splitTitle.length;
    const titleHeight = (titleLines - 1) * 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PRAKTIKUM & INTERNSHIP', 130, 32 + titleHeight, { align: 'center' });
    doc.text('KAUNSELING (KESIHATAN MENTAL KLINIKAL)', 130, 38 + titleHeight, { align: 'center' });
    doc.text('UNIVERSITI PENDIDIKAN SULTAN IDRIS', 130, 44 + titleHeight, { align: 'center' });

    // Clinical File ID
    if (clinicalId) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 128);
        doc.text(`CLINICAL FILE ID: ${clinicalId}`, 130, 14, { align: 'center' });
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

    const getFriendlySessionNumber = () => {
        if (session.formData?.logisticsData?.numberOfSession) {
            return String(session.formData.logisticsData.numberOfSession);
        }
        if (session.formData?.personalData?.sessionNumber) {
            return String(session.formData.personalData.sessionNumber);
        }
        if (session.formData?.sessionNumber) {
            return String(session.formData.sessionNumber);
        }
        if (session.sessionId && !session.sessionId.startsWith('C1')) {
            return session.sessionId;
        }
        return "1";
    };

    const getFriendlyDate = () => {
        if (session.formData?.logisticsData?.dateTime) {
            const dt = session.formData.logisticsData.dateTime;
            return dt.split('T')[0];
        }
        if (session.formData?.personalData?.sessionDateTime) {
            return session.formData.personalData.sessionDateTime.split(' ')[0];
        }
        return formattedDate;
    };

    const getFriendlyDuration = () => {
        if (session.formData?.logisticsData?.duration) {
            return `${session.formData.logisticsData.duration} hrs`;
        }
        if (session.formData?.personalData?.duration) {
            return `${session.formData.personalData.duration} hrs`;
        }
        if (session.duration) {
            return `${session.duration} hrs`;
        }
        return "N/A";
    };

    const headerBody = [];
    if (client.type === 'KK') {
        headerBody.push([
            'Group Identifier:', renderStr(client.demographics.name),
            'Clinical File ID:', renderStr(clinicalId)
        ]);
        headerBody.push([
            'Session Number:', getFriendlySessionNumber(),
            'Date:', getFriendlyDate()
        ]);
        headerBody.push([
            'Duration:', getFriendlyDuration(),
            'Type of Group:', renderStr(session.formData?.logisticsData?.typeOfGroup)
        ]);
    } else {
        if (session.formData && session.formData.personalData) {
            headerBody.push(['Client Name:', renderStr(client.demographics.name), 'Client File Number:', renderStr(client.clientId || 'N/A')]);
        } else {
            headerBody.push(['Client Name:', renderStr(client.demographics.name), 'Client File Number:', renderStr(client.clientId || 'N/A')]);
            headerBody.push(['Session Number:', getFriendlySessionNumber(), 'Date:', getFriendlyDate()]);
            headerBody.push(['Duration:', getFriendlyDuration(), '', '']);
        }
    }

    autoTable(doc, {
        startY: 52 + titleHeight, // Moved down to 52 + titleHeight (Prev: 40)
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

    const addSection = (title: string, content: any) => {
        let displayTitle = title.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // Convert camelCase to Title Case
        if (title === 'sessionDateTime') displayTitle = 'Session Date & Time';
        if (title === 'groupMembers') displayTitle = 'Group Members & Brief Progress';

        checkPageBreak(15);
        doc.setFont('helvetica', 'bold');
        doc.text(displayTitle.toUpperCase(), 15, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 6;

        if (title === 'groupMembers' && Array.isArray(content)) {
            // Render group members as a clean table with Name and Brief Progress
            const tableBody = content
                .filter(member => member && (member.name || member.progress))
                .map((member, idx) => [
                    String(idx + 1),
                    renderStr(member.name),
                    renderStr(member.progress)
                ]);

            autoTable(doc, {
                startY: yPos,
                theme: 'grid',
                head: [['No.', 'Member Name', 'Brief Progress Report']],
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
                styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center' },
                    1: { fontStyle: 'bold', cellWidth: 45 },
                    2: { cellWidth: 125 }
                },
                body: tableBody,
            });
            yPos = (doc as any).lastAutoTable.finalY + 8;
        } else if (typeof content === 'object' && content !== null) {
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
        // Automatically iterate all roots of formData, putting objects (like personalData) first, then long narratives
        const entries = Object.entries(session.formData);

        // Render Objects first
        entries.filter(e => typeof e[1] === 'object').forEach(([k, v]) => addSection(k, v));

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
            head: [['Action', 'Signature & Name', 'Date']],
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', lineWidth: 0.2, lineColor: [0, 0, 0] },
            body: [
                [
                    'Trainee Counselor Signature',
                    '..................................................\n(' + (data.traineeSignature || '').toUpperCase() + ')',
                    'DD/MM/YYYY'
                ],
                [
                    'Site Supervisor Signature',
                    '..................................................\n(' + (data.siteSupervisorSignature || '').toUpperCase() + ')',
                    'DD/MM/YYYY'
                ],
                [
                    'Academic Supervisor Signature',
                    '..................................................\n(' + (data.academicSupervisorSignature || '').toUpperCase() + ')',
                    'DD/MM/YYYY'
                ]
            ],
            styles: { font: 'helvetica', fontSize: 9, minCellHeight: 25, valign: 'middle', halign: 'center', textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] },
            columnStyles: {
                0: { cellWidth: 45, fontStyle: 'bold' },
                1: { cellWidth: 100 },
                2: { cellWidth: 35, textColor: [150, 150, 150] }
            },
            margin: { left: 15, right: 15 }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
        // Standard Single Signature (Forms 1, 2, 3, 4, 5, 6, 11, 13)
        const name = session.formData?.counselorNameSignature || 
                     session.formData?.traineeSignature || 
                     session.formData?.counsellorName || 
                     session.formData?.logisticsData?.counsellorName || 
                     session.formData?.logisticsData?.counselorName || 
                     "";
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

const generateForm11PDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Helper to render string
    const renderStr = (val: any) => val !== undefined && val !== null && val !== "" ? String(val) : "";

    // Header logo & branding
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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("GROUP COUNSELING REPORT", 130, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text("PRACTICUM & INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING", 130, 24, { align: 'center' });
    doc.text("UNIVERSITI PENDIDIKAN SULTAN IDRIS", 130, 30, { align: 'center' });

    const logisticsData = session.formData?.logisticsData || {};
    const groupMembers = session.formData?.groupMembers || [];

    // Format date and time
    let dateVal = "";
    let timeVal = "";
    if (logisticsData.dateTime) {
        const parts = logisticsData.dateTime.split('T');
        dateVal = parts[0] || "";
        timeVal = parts[1] || "";
    }

    // Prepare table body mirroring the original form layout
    const tableBody = [
        [
            { content: 'Group Leader/Counselor', styles: { fontStyle: 'bold', fillColor: [252, 229, 205], textColor: [0, 0, 0] } },
            { content: renderStr(logisticsData.counsellorName || logisticsData.counselorName), colSpan: 5 }
        ],
        [
            { content: 'Date', styles: { fontStyle: 'bold' } },
            { content: dateVal },
            { content: 'Time', styles: { fontStyle: 'bold' } },
            { content: timeVal },
            { content: 'Duration', styles: { fontStyle: 'bold' } },
            { content: renderStr(logisticsData.duration) }
        ],
        [
            { content: 'Type of Group', styles: { fontStyle: 'bold' } },
            { content: renderStr(logisticsData.typeOfGroup), colSpan: 5 }
        ],
        [
            { content: 'Number of Session', styles: { fontStyle: 'bold' } },
            { content: renderStr(logisticsData.numberOfSession), colSpan: 5 }
        ],
        [
            { content: 'Number of Clients\nAttending the Group', styles: { fontStyle: 'bold' } },
            { content: renderStr(logisticsData.numberOfClientsAttending), colSpan: 5 }
        ],
        [
            { content: 'Name of Clients Attending\nThe Group', styles: { fontStyle: 'bold' } },
            { 
                content: Array.from({ length: 8 }).map((_, idx) => {
                    const memberName = groupMembers[idx]?.name || "";
                    return `${idx + 1}. ${memberName}`;
                }).join('\n'), 
                colSpan: 5 
            }
        ],
        [
            { content: 'Issues Focused of the day', styles: { fontStyle: 'bold' } },
            { content: renderStr(session.formData?.narrative?.issuesFocused), colSpan: 5 }
        ],
        [
            { content: 'Session Objectives', styles: { fontStyle: 'bold' } },
            { content: renderStr(session.formData?.narrative?.sessionObjectives), colSpan: 5 }
        ]
    ];

    autoTable(doc, {
        startY: 38,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 35 },
            2: { cellWidth: 20 },
            3: { cellWidth: 30 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 }
        },
        body: tableBody as any,
    });

    let yPos = (doc as any).lastAutoTable.finalY + 10;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
    };

    // Render Narrative Sections in plain text layout
    const narrative = session.formData?.narrative || {};
    const sections = [
        { title: "Background Information of the Group Members /Observations Result", content: narrative.backgroundInfo },
        { title: "Group Initial Stage", content: narrative.groupInitialStage },
        { title: "Mid-Stage/Group Working Stage", content: narrative.midStageWorking },
        { title: "Theoretical Approach/Group Techniques Used", content: narrative.theoreticalApproach },
        { title: "Diagnostic Impression/Intervention", content: narrative.diagnosticImpression },
        { title: "Client Progress/Barriers (Internal/External Dynamics Supporting or Hindering Change)", content: narrative.clientProgressBarriers },
        { title: "Treatment Planning", content: narrative.treatmentPlanning },
        { title: "Termination/Closing Stage and Follow Up Actions", content: narrative.terminationClosing },
        { title: "Counselor's Comments/Reflections", content: narrative.counsellorsComments || narrative.counselorsComments }
    ];

    sections.forEach((sec) => {
        const textContent = renderStr(sec.content);
        const splitText = doc.splitTextToSize(textContent, 180);
        checkPageBreak(splitText.length * 5 + 15);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(sec.title, 15, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(splitText, 15, yPos);
        yPos += (splitText.length * 5) + 10;
    });

    // Force Page Break for Brief Individual Progress Report Section
    doc.addPage();
    yPos = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text("Brief Individual Progress Report For Each Group Member", 15, yPos);
    yPos += 10;

    // Render group member progress report fields
    groupMembers.forEach((member: any, idx: number) => {
        checkPageBreak(30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        const memberNameText = member.name ? ` (${member.name.toUpperCase()})` : '';
        doc.text(`Group Member ${idx + 1}:${memberNameText}`, 15, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        const progressText = member.progress || "";
        const splitProgress = doc.splitTextToSize(progressText, 180);
        doc.text(splitProgress, 15, yPos);
        yPos += (splitProgress.length * 5) + 10;
    });

    // Render signature block
    checkPageBreak(55);
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Report by:", 15, yPos);
    yPos += 12;

    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.setLineWidth(0.4);
    doc.line(15, yPos, 95, yPos);
    doc.setLineDashPattern([], 0);

    yPos += 5;
    const signatureName = session.formData?.counselorNameSignature || session.formData?.traineeSignature || "";
    doc.text(`(  ${signatureName.toUpperCase()}  )`, 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text("CMCH Counselor Trainee", 15, yPos);
    yPos += 5;
    doc.text("Universiti Pendidikan Sultan Idris", 15, yPos);
    yPos += 5;
    doc.text("35900 Tanjong Malim, Perak", 15, yPos);

    // Apply header/footers on all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        // Header Reference
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text("Group_Counseling_Report/CMHC_UPSI/11-2025", 195, 10, { align: 'right' });

        doc.text("Confidential Document (For Professional Use Only)", 15, 285);
    }

    return doc.output('blob');
};

const generateForm1PDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const renderStr = (val: any) => val !== undefined && val !== null && val !== "" ? String(val) : "";

    // Logo & branding header
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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("PSYCHOLOGICAL INTAKE REPORT", 130, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text("PRACTICUM & INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING", 130, 24, { align: 'center' });
    doc.text("UNIVERSITI PENDIDIKAN SULTAN IDRIS", 130, 30, { align: 'center' });

    const pd = session.formData?.personalData || {};

    const tableBody = [
        [
            { content: 'Session Number', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.sessionNumber) },
            { content: 'Session Date & Time', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.sessionDateTime) }
        ],
        [
            { content: 'Client Full Name', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.clientFullName), colSpan: 3 }
        ],
        [
            { content: 'Ethnic/Sex', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.ethnicSex) },
            { content: 'Age', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.age) }
        ],
        [
            { content: 'Date of Birth', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.dateOfBirth) },
            { content: 'Identification Card No', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.icNumber) }
        ],
        [
            { content: 'Designation', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.designation) },
            { content: 'Date of Report', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.dateOfReport) }
        ]
    ];

    autoTable(doc, {
        startY: 38,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 45 },
            2: { cellWidth: 45 },
            3: { cellWidth: 45 }
        },
        body: tableBody as any,
    });

    let yPos = (doc as any).lastAutoTable.finalY + 10;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
    };

    const sections = [
        { title: "REASON FOR REFERRAL", content: session.formData?.reasonForReferral },
        { title: "BEHAVIOUR OBSERVATION", content: session.formData?.behaviourObservation },
        { title: "HISTORY OF PRESENTING ISSUES", content: session.formData?.historyOfPresentingIssues },
        { title: "PSYCHIATRIC HISTORY", content: session.formData?.psychiatricHistory },
        { title: "MEDICAL HISTORY", content: session.formData?.medicalHistory },
        { title: "FAMILY HISTORY", content: session.formData?.familyHistory },
        { title: "DEVELOPMENTAL HISTORY", content: session.formData?.developmentalHistory },
        { title: "SOCIAL HISTORY", content: session.formData?.socialHistory },
        { title: "SUBSTANCE USE HISTORY", content: session.formData?.substanceUseHistory },
        { title: "CURRENT SITUATION FUNCTIONING", content: session.formData?.currentSituationFunctioning },
        { title: "ASSESSMENT RESULT", content: session.formData?.assessmentResult },
        { title: "CLINICAL JUDGEMENT", content: session.formData?.clinicalJudgement },
        { title: "DIAGNOSTIC IMPRESSION / PROVISIONAL DIAGNOSTIC", content: session.formData?.diagnosticImpression },
        { title: "GOALS OF THE SESSION", content: session.formData?.GoalsOfSession || session.formData?.goalsOfSession },
        { title: "TREATMENT PLANNING", content: session.formData?.treatmentPlanning }
    ];

    sections.forEach((sec) => {
        const textContent = renderStr(sec.content);
        const splitText = doc.splitTextToSize(textContent, 180);
        checkPageBreak(splitText.length * 5 + 15);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(sec.title, 15, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(splitText, 15, yPos);
        yPos += (splitText.length * 5) + 10;
    });

    // Render signature block
    checkPageBreak(55);
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Report by:", 15, yPos);
    yPos += 12;

    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.setLineWidth(0.4);
    doc.line(15, yPos, 95, yPos);
    doc.setLineDashPattern([], 0);

    yPos += 5;
    const signatureName = session.formData?.counselorName || "";
    doc.text(`(  ${signatureName.toUpperCase()}  )`, 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text("CMCH Counselor Trainee", 15, yPos);
    doc.text("Universiti Pendidikan Sultan Idris", 15, yPos + 5);
    doc.text("35900 Tanjong Malim, Perak", 15, yPos + 10);

    // Apply header/footers on all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text("Psychological_Intake_Report/CMHC_UPSI/01-2025", 195, 10, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        doc.text("Confidential Document (For Professional Use Only)", 15, 285);
    }

    return doc.output('blob');
};

const generateForm2PDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const renderStr = (val: any) => val !== undefined && val !== null && val !== "" ? String(val) : "";

    // Logo & branding header
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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("PROGRESSIVE NOTES", 130, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text("PRACTICUM & INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING", 130, 24, { align: 'center' });
    doc.text("UNIVERSITI PENDIDIKAN SULTAN IDRIS", 130, 30, { align: 'center' });

    const pd = session.formData?.personalData || {};

    const tableBody = [
        [
            { content: 'Session Number', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.sessionNumber) },
            { content: 'Session Date & Time', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.sessionDateTime) }
        ],
        [
            { content: 'Client Full Name', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.clientFullName) },
            { content: 'Date of Report', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.dateOfReport) }
        ],
        [
            { content: 'Diagnosis', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.diagnosis), colSpan: 3 }
        ]
    ];

    autoTable(doc, {
        startY: 38,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 45 },
            2: { cellWidth: 45 },
            3: { cellWidth: 45 }
        },
        body: tableBody as any,
    });

    let yPos = (doc as any).lastAutoTable.finalY + 10;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
    };

    const sections = [
        { title: "SUBJECTIVE (S)", content: session.formData?.subjective },
        { title: "OBJECTIVE (O)", content: session.formData?.objective },
        { title: "ASSESSMENT (A)", content: session.formData?.assessment },
        { title: "PLAN (P)", content: session.formData?.plan }
    ];

    sections.forEach((sec) => {
        const textContent = renderStr(sec.content);
        const splitText = doc.splitTextToSize(textContent, 180);
        checkPageBreak(splitText.length * 5 + 15);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(sec.title, 15, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(splitText, 15, yPos);
        yPos += (splitText.length * 5) + 10;
    });

    // Render signature block
    checkPageBreak(55);
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Report by:", 15, yPos);
    yPos += 12;

    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.setLineWidth(0.4);
    doc.line(15, yPos, 95, yPos);
    doc.setLineDashPattern([], 0);

    yPos += 5;
    const signatureName = session.formData?.counsellorName || "";
    doc.text(`(  ${signatureName.toUpperCase()}  )`, 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text("CMCH Counselor Trainee", 15, yPos);
    doc.text("Universiti Pendidikan Sultan Idris", 15, yPos + 5);
    doc.text("35900 Tanjong Malim, Perak", 15, yPos + 10);

    // Apply header/footers on all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text("Progressive_Notes/CMHC_UPSI/02-2025", 195, 10, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        doc.text("Confidential Document (For Professional Use Only)", 15, 285);
    }

    return doc.output('blob');
};

const generateForm3PDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const renderStr = (val: any) => val !== undefined && val !== null && val !== "" ? String(val) : "";

    // Logo & branding header
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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("CASE CONCEPTUALIZATION", 130, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text("PRACTICUM & INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING", 130, 24, { align: 'center' });
    doc.text("UNIVERSITI PENDIDIKAN SULTAN IDRIS", 130, 30, { align: 'center' });

    const pd = session.formData?.personalData || {};

    const tableBody = [
        [
            { content: 'Client Full Name', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.clientFullName) },
            { content: 'Ethnic/Sex', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.ethnicSex) }
        ],
        [
            { content: 'Age', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.age) },
            { content: 'Diagnosis', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.diagnosis) }
        ]
    ];

    autoTable(doc, {
        startY: 38,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 45 },
            2: { cellWidth: 45 },
            3: { cellWidth: 45 }
        },
        body: tableBody as any,
    });

    let yPos = (doc as any).lastAutoTable.finalY + 10;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
    };

    const sections = [
        { title: "CLIENT'S PROFILE", content: session.formData?.clientsProfile },
        { title: "PRESENTING PROBLEM", content: session.formData?.presentingProblem },
        { title: "PREDISPOSING FACTORS", content: session.formData?.predisposingFactors },
        { title: "PRECIPITATING FACTORS", content: session.formData?.precipitatingFactors },
        { title: "PERPETUATING FACTORS", content: session.formData?.perpetuatingFactors },
        { title: "PROTECTIVE FACTORS", content: session.formData?.protectiveFactors },
        { title: "OVERALL SUMMARY", content: session.formData?.overallSummary }
    ];

    sections.forEach((sec) => {
        const textContent = renderStr(sec.content);
        const splitText = doc.splitTextToSize(textContent, 180);
        checkPageBreak(splitText.length * 5 + 15);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(sec.title, 15, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(splitText, 15, yPos);
        yPos += (splitText.length * 5) + 10;
    });

    // Render signature block
    checkPageBreak(55);
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Report by:", 15, yPos);
    yPos += 12;

    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.setLineWidth(0.4);
    doc.line(15, yPos, 95, yPos);
    doc.setLineDashPattern([], 0);

    yPos += 5;
    const signatureName = session.formData?.counsellorName || "";
    doc.text(`(  ${signatureName.toUpperCase()}  )`, 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text("CMCH Counselor Trainee", 15, yPos);
    doc.text("Universiti Pendidikan Sultan Idris", 15, yPos + 5);
    doc.text("35900 Tanjong Malim, Perak", 15, yPos + 10);

    // Apply header/footers on all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text("Case_Conceptualization/CMHC_UPSI/03-2025", 195, 10, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        doc.text("Confidential Document (For Professional Use Only)", 15, 285);
    }

    return doc.output('blob');
};

const generateForm4PDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const renderStr = (val: any) => val !== undefined && val !== null && val !== "" ? String(val) : "";

    // Logo & branding header
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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("CLINICAL TREATMENT PLAN", 130, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text("PRACTICUM & INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING", 130, 24, { align: 'center' });
    doc.text("UNIVERSITI PENDIDIKAN SULTAN IDRIS", 130, 30, { align: 'center' });

    const pd = session.formData?.personalData || {};

    const tableBody = [
        [
            { content: 'Client Full Name', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.clientFullName) },
            { content: 'Ethnic/Sex', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.ethnicSex) }
        ],
        [
            { content: 'Age', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.age) },
            { content: 'Diagnosis', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.diagnosis) }
        ]
    ];

    autoTable(doc, {
        startY: 38,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 45 },
            2: { cellWidth: 45 },
            3: { cellWidth: 45 }
        },
        body: tableBody as any,
    });

    let yPos = (doc as any).lastAutoTable.finalY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text("CLINICAL TREATMENT PLAN", 15, yPos);
    yPos += 5;

    const treatmentPlans = session.formData?.treatmentPlans || [];
    const planTableBody = treatmentPlans.map((plan: any) => [
        renderStr(plan.goal),
        renderStr(plan.intervention),
        renderStr(plan.outcome)
    ]);

    autoTable(doc, {
        startY: yPos,
        theme: 'grid',
        head: [['Goal(s)', 'Therapeutic Intervention', 'Outcome Measures of Change']],
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.2 },
        columnStyles: {
            0: { cellWidth: 55 },
            1: { cellWidth: 70 },
            2: { cellWidth: 55 }
        },
        body: planTableBody,
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
    };

    // Render signature block
    checkPageBreak(55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Report by:", 15, yPos);
    yPos += 12;

    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.setLineWidth(0.4);
    doc.line(15, yPos, 95, yPos);
    doc.setLineDashPattern([], 0);

    yPos += 5;
    const signatureName = session.formData?.counsellorName || "";
    doc.text(`(  ${signatureName.toUpperCase()}  )`, 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text("CMCH Counselor Trainee", 15, yPos);
    doc.text("Universiti Pendidikan Sultan Idris", 15, yPos + 5);
    doc.text("35900 Tanjong Malim, Perak", 15, yPos + 10);

    // Apply header/footers on all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text("Clinical_Treatment_Plan/CMHC_UPSI/04-2025", 195, 10, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        doc.text("Confidential Document (For Professional Use Only)", 15, 285);
    }

    return doc.output('blob');
};

const generateForm5PDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const renderStr = (val: any) => val !== undefined && val !== null && val !== "" ? String(val) : "";

    // Logo & branding header
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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("TERMINATION OF COUNSELING SESSION", 130, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text("PRACTICUM & INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING", 130, 24, { align: 'center' });
    doc.text("UNIVERSITI PENDIDIKAN SULTAN IDRIS", 130, 30, { align: 'center' });

    const pd = session.formData?.personalData || {};

    const tableBody = [
        [
            { content: 'Client Name', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.clientName) },
            { content: 'Gender', styles: { fontStyle: 'bold' } },
            { content: renderStr((pd.ethnicGender || " / ").split(" / ")[1]) }
        ],
        [
            { content: 'Age', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.age) },
            { content: 'Ethnic', styles: { fontStyle: 'bold' } },
            { content: renderStr((pd.ethnicGender || " / ").split(" / ")[0]) }
        ],
        [
            { content: 'Position', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.position) },
            { content: 'Diagnosis', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.diagnosis) }
        ],
        [
            { content: 'Date of Report', styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.dateOfReport), colSpan: 3 }
        ]
    ];

    autoTable(doc, {
        startY: 38,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 45 },
            2: { cellWidth: 45 },
            3: { cellWidth: 45 }
        },
        body: tableBody as any,
    });

    let yPos = (doc as any).lastAutoTable.finalY + 10;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
    };

    const sections = [
        { title: "SYNOPSIS", content: session.formData?.synopsis },
        { title: "EVALUATION OF THE CLIENT'S CURRENT FUNCTIONING LEVEL", content: session.formData?.evaluationCurrentFunctioning },
        { title: "JUSTIFICATION FOR TERMINATION", content: session.formData?.justificationTermination },
        { title: "SUMMARY OF PROGRESS TOWARDS GOALS (INCLUDING FINAL DIAGNOSTIC IMPRESSION)", content: session.formData?.summaryProgress },
        { title: "CLINICAL EVALUATION", content: session.formData?.clinicalEvaluation },
        { title: "FOLLOW UP PLAN", content: session.formData?.followUpPlan }
    ];

    sections.forEach((sec) => {
        const textContent = renderStr(sec.content);
        const splitText = doc.splitTextToSize(textContent, 180);
        checkPageBreak(splitText.length * 5 + 15);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(sec.title, 15, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(splitText, 15, yPos);
        yPos += (splitText.length * 5) + 10;
    });

    // Render signature block
    checkPageBreak(55);
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Report by:", 15, yPos);
    yPos += 12;

    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.setLineWidth(0.4);
    doc.line(15, yPos, 95, yPos);
    doc.setLineDashPattern([], 0);

    yPos += 5;
    const signatureName = session.formData?.counsellorName || "";
    doc.text(`(  ${signatureName.toUpperCase()}  )`, 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text("CMCH Counselor Trainee", 15, yPos);
    doc.text("Universiti Pendidikan Sultan Idris", 15, yPos + 5);
    doc.text("35900 Tanjong Malim, Perak", 15, yPos + 10);

    // Apply header/footers on all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text("Termination_Session/CMHC_UPSI/05-2025", 195, 10, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        doc.text("Confidential Document (For Professional Use Only)", 15, 285);
    }

    return doc.output('blob');
};

const generateForm6PDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const renderStr = (val: any) => val !== undefined && val !== null && val !== "" ? String(val) : "";

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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("CRISIS INTERVENTION REPORT", 130, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text("PRACTICUM & INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING", 130, 24, { align: 'center' });
    doc.text("UNIVERSITI PENDIDIKAN SULTAN IDRIS", 130, 30, { align: 'center' });

    const fd = session.formData || {};

    const tableBody = [
        [
            { content: 'Client Name', styles: { fontStyle: 'bold' } },
            { content: renderStr(fd.clientName) },
            { content: 'Date', styles: { fontStyle: 'bold' } },
            { content: renderStr(fd.date) }
        ],
        [
            { content: 'Gender', styles: { fontStyle: 'bold' } },
            { content: renderStr(fd.gender) },
            { content: 'Time', styles: { fontStyle: 'bold' } },
            { content: renderStr(fd.time) }
        ],
        [
            { content: 'Age', styles: { fontStyle: 'bold' } },
            { content: renderStr(fd.age) },
            { content: 'Location', styles: { fontStyle: 'bold' } },
            { content: renderStr(fd.location) }
        ],
        [
            { content: 'Type of Crisis', styles: { fontStyle: 'bold' } },
            { content: renderStr(fd.typeOfCrisis), colSpan: 3 }
        ]
    ];

    autoTable(doc, {
        startY: 38,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 45 },
            2: { cellWidth: 45 },
            3: { cellWidth: 45 }
        },
        body: tableBody as any,
    });

    let yPos = (doc as any).lastAutoTable.finalY + 10;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
    };

    const sections = [
        { title: "Crisis Description", content: fd.crisisDescription },
        { title: "Crisis Intervention Provided", content: fd.crisisIntervention },
        { title: "Need for Referral", content: fd.needReferral },
        { title: "Follow Up Plan (If Needed)", content: fd.followUpPlan }
    ];

    sections.forEach((sec) => {
        const textContent = renderStr(sec.content);
        const splitText = doc.splitTextToSize(textContent, 180);
        checkPageBreak(splitText.length * 5 + 15);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(sec.title, 15, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(splitText, 15, yPos);
        yPos += (splitText.length * 5) + 10;
    });

    checkPageBreak(55);
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Report by:", 15, yPos);
    yPos += 12;

    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.setLineWidth(0.4);
    doc.line(15, yPos, 95, yPos);
    doc.setLineDashPattern([], 0);

    yPos += 5;
    const signatureName = fd.counsellorName || "";
    doc.text(`(  ${signatureName.toUpperCase()}  )`, 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text("CMCH Counselor Trainee", 15, yPos);
    doc.text("Universiti Pendidikan Sultan Idris", 15, yPos + 5);
    doc.text("35900 Tanjong Malim, Perak", 15, yPos + 10);

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text("Crisis_Intervention_Report/CMHC_UPSI/06-2025", 195, 10, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        doc.text("Confidential Document (For Professional Use Only)", 15, 285);
    }

    return doc.output('blob');
};

const generateForm7PDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const renderStr = (val: any) => val !== undefined && val !== null && val !== "" ? String(val) : "";

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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("CONSULTATION REPORT", 130, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text("PRACTICUM & INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING", 130, 24, { align: 'center' });
    doc.text("UNIVERSITI PENDIDIKAN SULTAN IDRIS", 130, 30, { align: 'center' });

    const fd = session.formData || {};
    const ld = fd.logisticsData || {};

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Name: ${renderStr(ld.consultantName)}`, 15, 38);
    doc.text(`Institution: ${renderStr(ld.institution)}`, 130, 38);

    const tableBody = [
        [
            { content: "Client's Name", styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.clientName) },
            { content: "Guardian's Name", styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.guardiansName) }
        ],
        [
            { content: 'Date & Time', styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.dateTime) },
            { content: 'Venue', styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.venue) }
        ],
        [
            { content: 'Attendance Type', styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.attendanceType), colSpan: 3 }
        ]
    ];

    autoTable(doc, {
        startY: 42,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 45 },
            2: { cellWidth: 45 },
            3: { cellWidth: 45 }
        },
        body: tableBody as any,
    });

    let yPos = (doc as any).lastAutoTable.finalY + 10;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
    };

    const sections = [
        { title: "Issue (s) Discussed", content: fd.issuesDiscussed },
        { title: "Intervention / Resolution Actions", content: fd.interventionActions },
        { title: "Follow-Up", content: fd.followUp }
    ];

    sections.forEach((sec) => {
        const textContent = renderStr(sec.content);
        const splitText = doc.splitTextToSize(textContent, 180);
        checkPageBreak(splitText.length * 5 + 15);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(sec.title, 15, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(splitText, 15, yPos);
        yPos += (splitText.length * 5) + 10;
    });

    // Referral Specs
    const referral = fd.referral || {};
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.text(`Referral Needed: ${renderStr(referral.referralNeeded)}`, 15, yPos);
    yPos += 6;
    if (referral.referralSpecifics) {
        doc.setFont('helvetica', 'normal');
        doc.text(`Referral (If necessary, please specify): ${renderStr(referral.referralSpecifics)}`, 15, yPos);
        yPos += 10;
    }

    // Signature table
    const sigs = fd.signatures || {};
    checkPageBreak(50);

    const sigsBody = [
        [
            { content: "Trainee Counselor's Signature", styles: { fontStyle: 'bold' } },
            { content: `( ${renderStr(sigs.traineeSignature)} )` },
            { content: "" }
        ],
        [
            { content: "Site Supervisor's Signature", styles: { fontStyle: 'bold' } },
            { content: `( ${renderStr(sigs.siteSupervisorSignature)} )` },
            { content: "" }
        ],
        [
            { content: "Academic Supervisor's Signature", styles: { fontStyle: 'bold' } },
            { content: `( ${renderStr(sigs.academicSupervisorSignature)} )` },
            { content: "" }
        ]
    ];

    autoTable(doc, {
        startY: yPos,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        head: [
            [
                { content: 'Action', styles: { halign: 'center', fontStyle: 'bold' } },
                { content: 'Signature', styles: { halign: 'center', fontStyle: 'bold' } },
                { content: 'Date', styles: { halign: 'center', fontStyle: 'bold' } }
            ]
        ],
        body: sigsBody as any,
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text("Consultation_Report/CMHC_UPSI/07-2025", 195, 10, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        doc.text("Confidential Document (For Professional Use Only)", 15, 285);
    }

    return doc.output('blob');
};

const generateForm8PDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const renderStr = (val: any) => val !== undefined && val !== null && val !== "" ? String(val) : "";

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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("PSYCHOLOGICAL FIRST AID / MENTAL HEALTH & PSYCHOSOCIAL SUPPORT REPORT", 105, 36, { align: 'center' });
    doc.setFontSize(10);
    doc.text("PRACTICUM & INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING", 105, 42, { align: 'center' });
    doc.text("UNIVERSITI PENDIDIKAN SULTAN IDRIS", 105, 48, { align: 'center' });

    const fd = session.formData || {};
    const ld = fd.logisticsData || {};

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Name: ${renderStr(ld.counselorName)}`, 15, 56);
    doc.text(`Institution: ${renderStr(ld.institution)}`, 130, 56);

    const tableBody = [
        [
            { content: "Program / Session", styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.programSessionType), colSpan: 3 }
        ],
        [
            { content: "Name of the Program/Session", styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.programName), colSpan: 3 }
        ],
        [
            { content: 'Date & Time', styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.dateTime) },
            { content: 'Venue', styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.venue) }
        ],
        [
            { content: 'Number of Participants Involved', styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.participantsCount) },
            { content: 'Speaker / Provider', styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.speakerProvider) }
        ],
        [
            { content: 'Collaborator(s) (If any)', styles: { fontStyle: 'bold' } },
            { content: renderStr(ld.collaborators), colSpan: 3 }
        ]
    ];

    autoTable(doc, {
        startY: 62,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 45 },
            2: { cellWidth: 45 },
            3: { cellWidth: 45 }
        },
        body: tableBody as any,
    });

    let yPos = (doc as any).lastAutoTable.finalY + 10;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
    };

    const narr = fd.narrative || {};
    const sections = [
        { title: "Objectives of the Program / Session", content: narr.objectives },
        { title: "Identified Issue (s)", content: narr.identifiedIssues },
        { title: "Activities / Interventions Delivered", content: narr.activitiesInterventions },
        { title: "Follow-Up (If needed)", content: narr.followUp }
    ];

    sections.forEach((sec) => {
        const textContent = renderStr(sec.content);
        const splitText = doc.splitTextToSize(textContent, 180);
        checkPageBreak(splitText.length * 5 + 15);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(sec.title, 15, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(splitText, 15, yPos);
        yPos += (splitText.length * 5) + 10;
    });

    // Referral Needed
    const referral = fd.referral || {};
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.text(`Referral Needed: ${renderStr(referral.referralNeeded)}`, 15, yPos);
    yPos += 6;
    if (referral.referralSpecifics) {
        doc.setFont('helvetica', 'normal');
        doc.text(`Referral (If necessary, please specify): ${renderStr(referral.referralSpecifics)}`, 15, yPos);
        yPos += 10;
    }

    // Signatures
    const sigs = fd.signatures || {};
    checkPageBreak(50);

    const sigsBody = [
        [
            { content: "Trainee Counselor's Signature", styles: { fontStyle: 'bold' } },
            { content: `( ${renderStr(sigs.traineeSignature)} )` },
            { content: "" }
        ],
        [
            { content: "Site Supervisor's Signature", styles: { fontStyle: 'bold' } },
            { content: `( ${renderStr(sigs.siteSupervisorSignature)} )` },
            { content: "" }
        ],
        [
            { content: "Academic Supervisor's Signature", styles: { fontStyle: 'bold' } },
            { content: `( ${renderStr(sigs.academicSupervisorSignature)} )` },
            { content: "" }
        ]
    ];

    autoTable(doc, {
        startY: yPos,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 90 },
            2: { cellWidth: 30 }
        },
        head: [
            [
                { content: 'Action', styles: { halign: 'center', fontStyle: 'bold' } },
                { content: 'Signature', styles: { halign: 'center', fontStyle: 'bold' } },
                { content: 'Date', styles: { halign: 'center', fontStyle: 'bold' } }
            ]
        ],
        body: sigsBody as any,
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text("PFA/MHPSS_Report/CMHC_UPSI/08-2025", 195, 10, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        doc.text("Confidential Document (For Professional Use Only)", 15, 285);
    }

    return doc.output('blob');
};

const generateForm13PDF = async (session: Session, client: Client, clinicalId?: string): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const renderStr = (val: any) => val !== undefined && val !== null && val !== "" ? String(val) : "";

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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("PSYCHOLOGICAL ASSESSMENT REPORT", 130, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text("PRACTICUM & INTERNSHIP IN CLINICAL MENTAL HEALTH COUNSELING", 130, 24, { align: 'center' });
    doc.text("UNIVERSITI PENDIDIKAN SULTAN IDRIS", 130, 30, { align: 'center' });

    const fd = session.formData || {};
    const pd = fd.personalData || {};

    const tableBody = [
        [
            { content: "Client Full Name", styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.clientFullName), colSpan: 3 }
        ],
        [
            { content: "Ethnic/Sex", styles: { fontStyle: 'bold' } },
            { content: `${renderStr(pd.ethnic)} / ${renderStr(pd.sex)}` },
            { content: "Date of Birth", styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.dateOfBirth) }
        ],
        [
            { content: "Identification Card No", styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.identificationCardNo) },
            { content: "Age", styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.age) }
        ],
        [
            { content: "Designation", styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.designation) },
            { content: "Date of Assessment", styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.dateOfAssessment) }
        ],
        [
            { content: "Assessment Conducted By", styles: { fontStyle: 'bold' } },
            { content: renderStr(pd.assessmentConductedBy), colSpan: 3 }
        ]
    ];

    autoTable(doc, {
        startY: 38,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 45 },
            2: { cellWidth: 45 },
            3: { cellWidth: 45 }
        },
        body: tableBody as any,
    });

    let yPos = (doc as any).lastAutoTable.finalY + 10;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 280) {
            doc.addPage();
            yPos = 20;
        }
    };

    const narr = fd.narrative || {};
    const sections = [
        { title: "REASON FOR REFERRAL", content: narr.reasonForReferral },
        { title: "BEHAVIOUR OBSERVATION", content: narr.behaviourObservation },
        { title: "PSYCHOLOGICAL TESTS ADMINISTERED", content: narr.psychologicalTestsAdministered },
        { title: "TEST RESULTS AND INTERPRETATION", content: narr.testResultsAndInterpretation },
        { title: "DIAGNOSTIC IMPRESSION", content: narr.diagnosticImpression },
        { title: "SUMMARY OF FINDINGS", content: narr.summaryOfFindings },
        { title: "RECOMMENDATIONS/TREATMENT PLAN", content: narr.recommendationsTreatmentPlan },
        { title: "PROGNOSIS", content: narr.prognosis }
    ];

    sections.forEach((sec) => {
        const textContent = renderStr(sec.content);
        const splitText = doc.splitTextToSize(textContent, 180);
        checkPageBreak(splitText.length * 5 + 15);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(sec.title, 15, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(splitText, 15, yPos);
        yPos += (splitText.length * 5) + 10;
    });

    checkPageBreak(55);
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("Report by:", 15, yPos);
    yPos += 12;

    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.setLineWidth(0.4);
    doc.line(15, yPos, 95, yPos);
    doc.setLineDashPattern([], 0);

    yPos += 5;
    const signatureName = fd.counselorNameSignature || "";
    doc.text(`(  ${signatureName.toUpperCase()}  )`, 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text("CMCH Counselor Trainee", 15, yPos);
    doc.text("Universiti Pendidikan Sultan Idris", 15, yPos + 5);
    doc.text("35900 Tanjong Malim, Perak", 15, yPos + 10);

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text("Clinical_Assessment_Report/CMHC_UPSI/13-2025", 195, 10, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        doc.text("Confidential Document (For Professional Use Only)", 15, 285);
    }

    return doc.output('blob');
};
