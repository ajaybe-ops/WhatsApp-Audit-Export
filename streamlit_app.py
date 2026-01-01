import streamlit as st
from pathlib import Path
import tempfile

st.set_page_config(page_title="WhatsApp Audit Export", layout="centered")

st.title("WhatsApp Audit Export")
st.caption("Convert WhatsApp chat exports into auditor‑ready Excel files")

st.markdown("""
This is a **Streamlit deployment entrypoint**.

Purpose:
- Upload a WhatsApp `.txt` export
- Run your existing parsing / audit logic
- Download a clean Excel output

You can later wire this UI to your real parsing code inside `server/` or `script/`.
""")

uploaded_file = st.file_uploader(
    "Upload WhatsApp chat export (.txt)",
    type=["txt"],
)

if uploaded_file:
    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = Path(tmpdir) / uploaded_file.name
        input_path.write_bytes(uploaded_file.read())

        st.success("File uploaded successfully")

        st.info("Parsing logic not yet wired")

        st.markdown("""
        **Next steps for you:**
        - Import your real parser here
        - Produce an Excel file
        - Expose it via `st.download_button`
        """)

st.divider()

st.markdown("""
**Deployment notes**
- This file must live at the repo root
- Streamlit Cloud → Main file path = `streamlit_app.py`
- Keep this file lightweight and UI‑only
""")
