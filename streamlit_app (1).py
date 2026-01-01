import streamlit as st
import pandas as pd
import re
from datetime import datetime
import io
import base64

# --- STYLING ---
st.set_page_config(
    page_title="Chat Ledger | WhatsApp Audit Tool",
    page_icon="🛡️",
    layout="wide"
)

st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .stButton>button {
        width: 100%;
        border-radius: 5px;
        height: 3em;
        background-color: #2c3e50;
        color: white;
    }
    .status-verified { color: #059669; font-weight: bold; }
    .status-likely { color: #0284c7; font-weight: bold; }
    .status-review { color: #d97706; font-weight: bold; }
    .status-unverifiable { color: #dc2626; font-weight: bold; }
    </style>
    """, unsafe_allow_html=True)

# --- PARSING LOGIC ---
def parse_whatsapp(text):
    # Standard patterns
    ios_pattern = r'^\[?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},? \d{1,2}:\d{2}(?::\d{2})?(?: [AP]M)?)\]? (.*?): (.*)'
    android_pattern = r'^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},? \d{1,2}:\d{2}) - (.*?): (.*)'
    system_pattern = r'^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},? \d{1,2}:\d{2}) - (.*)'

    messages = []
    lines = text.split('\n')
    
    current_msg = None
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        # Check patterns
        ios_match = re.match(ios_pattern, line)
        android_match = re.match(android_pattern, line)
        system_match = re.match(system_pattern, line)
        
        if ios_match:
            if current_msg: messages.append(current_msg)
            ts, sender, content = ios_match.groups()
            current_msg = {
                "When": ts,
                "Who": sender,
                "What": content,
                "Reliability": "Verified",
                "Why": "Standard iOS format detected.",
                "Raw": line
            }
        elif android_match:
            if current_msg: messages.append(current_msg)
            ts, sender, content = android_match.groups()
            current_msg = {
                "When": ts,
                "Who": sender,
                "What": content,
                "Reliability": "Verified",
                "Why": "Standard Android format detected.",
                "Raw": line
            }
        elif system_match:
            if current_msg: messages.append(current_msg)
            ts, content = system_match.groups()
            current_msg = {
                "When": ts,
                "Who": "System",
                "What": content,
                "Reliability": "Likely Accurate",
                "Why": "System notification detected.",
                "Raw": line
            }
        else:
            if current_msg:
                current_msg["What"] += " " + line
                current_msg["Raw"] += " " + line
                current_msg["Reliability"] = "Likely Accurate"
                current_msg["Why"] = "Multi-line message continuation."
            else:
                messages.append({
                    "When": "Unknown",
                    "Who": "Unknown",
                    "What": line,
                    "Reliability": "Unverifiable",
                    "Why": "Orphaned line/Malformed format.",
                    "Raw": line
                })
                
    if current_msg: messages.append(current_msg)
    return pd.DataFrame(messages)

# --- UI LAYOUT ---
st.title("🛡️ Chat Ledger")
st.subheader("Audit-Ready WhatsApp Chat Parser")
st.markdown("---")

col1, col2 = st.columns([1, 1])

with col1:
    st.info("### 1. Upload Export\nUpload your WhatsApp `.txt` file here.")
    uploaded_file = st.file_uploader("Choose a file", type=['txt'])
    
    if uploaded_file is not None:
        stringio = io.StringIO(uploaded_file.getvalue().decode("utf-8"))
        content = stringio.read()
        
        if st.button("Analyze Chat Log"):
            with st.spinner("Processing audit trail..."):
                df = parse_whatsapp(content)
                st.session_state['parsed_df'] = df
                st.success(f"Parsed {len(df)} messages successfully.")

with col2:
    st.info("### 2. Audit Summary\nReview findings before export.")
    if 'parsed_df' in st.session_state:
        df = st.session_state['parsed_df']
        
        # Stats
        v_count = len(df[df['Reliability'] == 'Verified'])
        l_count = len(df[df['Reliability'] == 'Likely Accurate'])
        n_count = len(df[df['Reliability'] == 'Needs Review'])
        u_count = len(df[df['Reliability'] == 'Unverifiable'])
        
        st.metric("Total Messages", len(df))
        
        m_col1, m_col2 = st.columns(2)
        m_col1.write(f"✅ **Verified**: {v_count}")
        m_col1.write(f"◑ **Likely**: {l_count}")
        m_col2.write(f"⚠ **Review**: {n_count}")
        m_col2.write(f"✗ **Unverifiable**: {u_count}")
        
        # Excel Export
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Audit Trail')
            # Add formatting logic here if needed
        
        processed_data = output.getvalue()
        st.download_button(
            label="📥 Download Audit Excel",
            data=processed_data,
            file_name=f"audit_report_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    else:
        st.write("Upload and analyze a file to see the summary.")

# --- DATA VIEW ---
if 'parsed_df' in st.session_state:
    st.markdown("---")
    st.subheader("📋 Audit Trail Review")
    
    df = st.session_state['parsed_df']
    
    # Filter
    status_filter = st.multiselect(
        "Filter by Reliability Status",
        options=["Verified", "Likely Accurate", "Needs Review", "Unverifiable"],
        default=["Verified", "Likely Accurate", "Needs Review", "Unverifiable"]
    )
    
    filtered_df = df[df['Reliability'].isin(status_filter)]
    st.dataframe(filtered_df, use_container_width=True)

# --- FOOTER ---
st.markdown("---")
st.caption("Chat Ledger is a deterministic parsing tool. It is intended as an audit aid, not a legal record.")
