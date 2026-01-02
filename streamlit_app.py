import streamlit as st
from pathlib import Path
import tempfile

st.set_page_config(page_title="WhatsApp Audit Export", layout="centered")

# ✅ ADD THIS LINE - Prevents auto-download
st.markdown('<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">', unsafe_allow_html=True)

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
