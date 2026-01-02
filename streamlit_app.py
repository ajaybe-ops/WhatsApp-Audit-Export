import streamlit as st
from pathlib import Path
import tempfile

# Configure page
st.set_page_config(
    page_title="WhatsApp Audit Export", 
    layout="centered",
    initial_sidebar_state="collapsed"
)

# Add meta tag to prevent auto-download
st.markdown("""
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
""", unsafe_allow_html=True)

st.title("WhatsApp Audit Export")
st.caption("Convert WhatsApp chat exports into auditor‑ready Excel files")

st.markdown("""
This is a **Streamlit deployment entrypoint**.

**Purpose:**
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
        
        st.success("✅ File uploaded successfully")
        st.info("ℹ️ Parsing logic not yet wired")
        
        # Preview file content
        with st.expander("📄 Preview uploaded file"):
            content = input_path.read_text(encoding='utf-8', errors='ignore')
            st.text(content[:1000] + "..." if len(content) > 1000 else content)
        
        st.markdown("""
        **Next steps for you:**
        - Import your real parser here
        - Produce an Excel file
        - Expose it via `st.download_button`
        
        Example:
```python
        
