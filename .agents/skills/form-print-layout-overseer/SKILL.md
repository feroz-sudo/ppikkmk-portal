---
name: form-print-layout-overseer
description: Oversees that all clinical forms tally 100% with original PDF designs, enforcing Arial 9pt font, 18mm/15mm A4 print margins, and exact field structure.
---

# Form & Print Layout Overseer Skill

This agent skill acts as an automated quality inspector and layout auditor for all **30 Internship Clinical Forms** and **Internship Logbook** in the PPIKKMK portal.

## Core Responsibilities

1. **Original PDF Tallying**:
   - Compares digital interactive form fields and headers against the original PDF documents located in `public/PDF CLINICAL FORMS_M262 2026/`.
   - Enforces exact title formats, copyright notices (*Dr. Pau Kee CMHC UPSI Pindaan 2026*), and section layouts.

2. **Typography Enforcement**:
   - Strictly enforces **Arial 9pt** (`font-family: Arial, Helvetica, sans-serif; font-size: 9pt;`) across form inputs, textareas, tables, labels, and exported outputs.

3. **Perfect A4 Print Margins**:
   - Enforces standardized `@page` margins: `top: 18mm, bottom: 18mm, left: 15mm, right: 15mm`.
   - Prevents table row truncation across page breaks using `page-break-inside: avoid`.
   - Ensures `-webkit-print-color-adjust: exact` so signature blocks and table borders render cleanly on paper or PDF exports.

4. **Practicum Data Isolation**:
   - Guarantees that internship forms and 28-week logbooks remain strictly within `/dashboard/internship/` and do not alter or mix with Practicum logbook data (`/dashboard/logbook`).
