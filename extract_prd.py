
import fitz  # PyMuPDF
import sys

def extract_text(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    path = r"c:\Users\aruun\OneDrive\Documents\Desktop\New folder (5)\appds\New folder\LifeTracker_Personal_Branding_PRD_v3_Expanded.pdf"
    content = extract_text(path)
    with open("branding_prd.txt", "w", encoding="utf-8") as f:
        f.write(content)
    print("Done")
