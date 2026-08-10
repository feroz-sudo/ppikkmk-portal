#!/usr/bin/env python3
"""
PDF Layout Extractor & WeasyPrint Replicator

Extracts text strings, bounding box coordinates, font sizes, embedded images,
and handles Jawi/Arabic script shaping via arabic_reshaper & python-bidi.
Recreates layout using HTML/CSS & clip-path geometric shapes.
"""

import os
import sys
import fitz  # PyMuPDF
import arabic_reshaper
from bidi.algorithm import get_display

def process_arabic_jawi(text: str) -> str:
    """Reshape and reorder Arabic/Jawi text for proper RTL display."""
    if any('\u0600' <= char <= '\u06FF' or '\u0750' <= char <= '\u077F' or '\u08A0' <= char <= '\u08FF' for char in text):
        reshaped_text = arabic_reshaper.reshape(text)
        return get_display(reshaped_text)
    return text

def extract_layout(pdf_path: str, output_dir: str = "extracted_assets"):
    """Extract text, font metadata, bounding boxes, and images from PDF."""
    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    
    extracted_pages = []
    
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        rect = page.rect
        width, height = rect.width, rect.height
        
        # Extract images
        image_list = page.get_images(full=True)
        saved_images = []
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_name = f"page_{page_idx+1}_img_{img_index+1}.{image_ext}"
            image_path = os.path.join(output_dir, image_name)
            with open(image_path, "wb") as f:
                f.write(image_bytes)
            saved_images.append(image_path)
            
        # Extract text blocks with coordinates and font attributes
        blocks = page.get_text("dict")["blocks"]
        text_elements = []
        
        for b in blocks:
            if "lines" in b:
                for l in b["lines"]:
                    for s in l["spans"]:
                        text = s["text"].strip()
                        if not text:
                            continue
                        
                        # Process Jawi/Arabic
                        processed_text = process_arabic_jawi(text)
                        
                        bbox = s["bbox"]  # (x0, y0, x1, y1)
                        font_size = s["size"]
                        font_name = s["font"]
                        color_int = s["color"]
                        # Convert integer color to hex
                        color_hex = f"#{(color_int & 0xFFFFFF):06x}"
                        
                        text_elements.append({
                            "text": processed_text,
                            "bbox": bbox,
                            "x0": round(bbox[0], 2),
                            "y0": round(bbox[1], 2),
                            "x1": round(bbox[2], 2),
                            "y1": round(bbox[3], 2),
                            "size": round(font_size, 2),
                            "font": font_name,
                            "color": color_hex
                        })
                        
        extracted_pages.append({
            "page": page_idx + 1,
            "width": width,
            "height": height,
            "images": saved_images,
            "elements": text_elements
        })
        
    return extracted_pages

def generate_weasyprint_html(extracted_pages, output_html="replicated_layout.html"):
    """Generate HTML/CSS template recreating page layout with CSS clip-path shapes."""
    html_content = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: 210mm 297mm;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: 'Arial', 'Helvetica', sans-serif;
    background-color: #ffffff;
  }
  .page-container {
    position: relative;
    width: 612pt;
    height: 792pt;
    page-break-after: always;
    overflow: hidden;
  }
  
  /* Geometric Teal & Yellow Accent Shapes */
  .accent-top-teal {
    position: absolute;
    top: 0;
    right: 0;
    width: 250pt;
    height: 250pt;
    background: linear-gradient(135deg, #00897b, #00acc1);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
  }
  .accent-top-yellow {
    position: absolute;
    top: 0;
    right: 0;
    width: 220pt;
    height: 220pt;
    background: #fbc02d;
    clip-path: polygon(100% 0, 20% 0, 100% 80%);
    opacity: 0.85;
  }
  
  /* Text Elements Positioning */
  .text-element {
    position: absolute;
    white-space: nowrap;
    line-height: 1.1;
  }
</style>
</head>
<body>
"""
    for p in extracted_pages:
        html_content += f'<div class="page-container">\n'
        html_content += '  <div class="accent-top-teal"></div>\n'
        html_content += '  <div class="accent-top-yellow"></div>\n'
        
        for elem in p["elements"]:
            style = f'left: {elem["x0"]}pt; top: {elem["y0"]}pt; font-size: {elem["size"]}pt; color: {elem["color"]};'
            html_content += f'  <div class="text-element" style="{style}">{elem["text"]}</div>\n'
            
        html_content += '</div>\n'
        
    html_content += "</body>\n</html>"
    
    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print(f"Generated HTML template: {output_html}")
    return output_html

if __name__ == "__main__":
    pdf_file = "src/lib/internship/CLINICAL LOG BOOK_M261 2026/BUKU LOG INTERNSHIP KKMK_M261 LATEST.pdf (1).pdf"
    if os.path.exists(pdf_file):
        data = extract_layout(pdf_file)
        generate_weasyprint_html(data)
    else:
        print(f"File {pdf_file} not found.")
