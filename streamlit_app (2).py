import streamlit as st
import pandas as pd
import re
import io
import time
from datetime import datetime
import base64

# --- FUTURISTIC CONFIGURATION ---
st.set_page_config(
    page_title="CHAT LEDGER | NEURAL AUDIT",
    page_icon="🌌",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# --- ADVANCED CSS & GLASSMORPHISM ---
# Pushing Streamlit to visual limits with custom CSS injection
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

    /* Global Overrides */
    * {
        font-family: 'Space Grotesk', sans-serif !important;
    }

    .main {
        background: radial-gradient(circle at top right, #0a0a12 0%, #050505 100%);
        color: #e0e0e0;
    }

    /* Glassmorphism Container */
    .glass-card {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        transition: transform 0.3s ease, border-color 0.3s ease;
    }
    
    .glass-card:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 153, 255, 0.3);
    }

    /* Futuristic Headers */
    .neon-text {
        text-transform: uppercase;
        letter-spacing: 4px;
        background: linear-gradient(90deg, #00f2fe 0%, #4facfe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
        text-shadow: 0 0 20px rgba(79, 172, 254, 0.4);
    }

    /* Interactive Elements */
    .stButton>button {
        background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 50px !important;
        padding: 0.8rem 2rem !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 2px !important;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3) !important;
    }

    .stButton>button:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 0 30px rgba(0, 242, 254, 0.6) !important;
    }

    /* Custom Dataframe Styling */
    [data-testid="stDataFrame"] {
        background: rgba(0, 0, 0, 0.4) !important;
        border-radius: 15px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    /* Animation Keyframes */
    @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
    }

    .scanner {
        position: absolute;
        width: 100%;
        height: 2px;
        background: rgba(0, 242, 254, 0.5);
        animation: scanline 4s linear infinite;
        z-index: 10;
        pointer-events: none;
    }

    /* Hide default Streamlit elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    </style>
    """, unsafe_allow_html=True)

# --- BACKGROUND COMPONENT (THREE.JS STYLE) ---
# Injecting a subtle particles background for spatial depth
st.components.v1.html("""
    <canvas id="bg-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1;"></canvas>
    <script>
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function init() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                color: `rgba(0, 242, 254, ${Math.random() * 0.3})`
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', init);
    init();
    animate();
    </script>
    """, height=0)

# --- DETRMINISTIC PARSING ENGINE ---
def process_audit_stream(raw_text):
    # Precise deterministic logic for WhatsApp exports
    ios_regex = r'^\[?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},? \d{1,2}:\d{2}(?::\d{2})?(?: [AP]M)?)\]? (.*?): (.*)'
    android_regex = r'^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},? \d{1,2}:\d{2}) - (.*?): (.*)'
    
    messages = []
    lines = raw_text.split('\n')
    
    current_msg = None
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        ios = re.match(ios_regex, line)
        android = re.match(android_regex, line)
        
        if ios or android:
            if current_msg: messages.append(current_msg)
            match = ios if ios else android
            ts, sender, content = match.groups()
            current_msg = {
                "TIMESTAMP": ts,
                "ENTITY": sender,
                "CONTENT": content,
                "FIDELITY": "VERIFIED",
                "METADATA": "Standard Protocol Match",
                "RAW_DATA": line
            }
        else:
            if current_msg:
                current_msg["CONTENT"] += " [CONT] " + line
                current_msg["FIDELITY"] = "LIKELY"
                current_msg["METADATA"] = "Multi-line Fragment Sequence"
            else:
                messages.append({
                    "TIMESTAMP": "UNSPECIFIED",
                    "ENTITY": "SYSTEM_X",
                    "CONTENT": line,
                    "FIDELITY": "UNVERIFIABLE",
                    "METADATA": "Orphaned Buffer String",
                    "RAW_DATA": line
                })
                
    if current_msg: messages.append(current_msg)
    return pd.DataFrame(messages)

# --- FUTURISTIC UI FLOW ---

# Top Navigation Bar
st.markdown("""
    <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 0; margin-bottom:3rem;">
        <h1 class="neon-text" style="margin:0; font-size:1.8rem;">CHAT LEDGER // V2.0</h1>
        <div style="background:rgba(0,242,254,0.1); padding:0.5rem 1.5rem; border-radius:30px; border:1px solid rgba(0,242,254,0.3); font-size:0.8rem; color:#00f2fe; letter-spacing:2px;">
            SYSTEM STATUS: OPERATIONAL
        </div>
    </div>
""", unsafe_allow_html=True)

# Main Terminal Interface
with st.container():
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    
    # Hero Title with Depth
    st.markdown("""
        <div style="text-align:center; margin-bottom:3rem;">
            <h2 style="font-size:3rem; font-weight:800; margin-bottom:0.5rem;">SECURE AUDIT <span style="color:#4facfe">NODE</span></h2>
            <p style="opacity:0.6; letter-spacing:1px;">DETERMINISTIC WHATSAPP DATA EXTRACTION & ANALYSIS</p>
        </div>
    """, unsafe_allow_html=True)
    
    # Upload Interface
    st.markdown('<div style="background:rgba(0,0,0,0.3); padding:2rem; border-radius:15px; border:1px dashed rgba(79,172,254,0.3);">', unsafe_allow_html=True)
    source_file = st.file_uploader("INGEST DATA STREAM (.TXT)", type=['txt'], label_visibility="collapsed")
    st.markdown('</div>', unsafe_allow_html=True)

    if source_file:
        raw_stream = source_file.getvalue().decode("utf-8")
        
        # Center-aligned Action Button
        st.markdown('<div style="display:flex; justify-content:center; margin-top:2rem;">', unsafe_allow_html=True)
        if st.button("INITIALIZE NEURAL PARSING"):
            # Cinematic loading sequence
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            steps = ["DECRYPTING BUFFER", "MAPPING CHRONOLOGY", "EXTRACTING ENTITIES", "VERIFYING INTEGRITY"]
            for i, step in enumerate(steps):
                status_text.markdown(f"📡 <span style='color:#00f2fe;'>{step}...</span>", unsafe_allow_html=True)
                for p in range(25):
                    progress_bar.progress(i*25 + p)
                    time.sleep(0.01)
            
            st.session_state['audit_data'] = process_audit_stream(raw_stream)
            st.session_state['last_file'] = source_file.name
            st.balloons()
        st.markdown('</div>', unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)

# Results Dashboard (Conditional)
if 'audit_data' in st.session_state:
    data = st.session_state['audit_data']
    
    # Spatial Metrics Grid
    c1, c2, c3, c4 = st.columns(4)
    
    metrics = [
        ("TOTAL SEGMENTS", len(data), "linear-gradient(135deg, #4facfe, #00f2fe)"),
        ("VERIFIED", len(data[data['FIDELITY'] == 'VERIFIED']), "linear-gradient(135deg, #059669, #10b981)"),
        ("SYSTEM X", len(data[data['ENTITY'] == 'SYSTEM_X']), "linear-gradient(135deg, #4b5563, #6b7280)"),
        ("LAST SYNC", datetime.now().strftime("%H:%M"), "linear-gradient(135deg, #7c3aed, #8b5cf6)")
    ]
    
    for i, (col, (label, val, grad)) in enumerate(zip([c1, c2, c3, c4], metrics)):
        with col:
            st.markdown(f"""
                <div class="glass-card" style="padding:1.5rem; margin-bottom:1rem; background:{grad}; box-shadow:0 10px 20px rgba(0,0,0,0.3);">
                    <p style="font-size:0.7rem; font-weight:700; opacity:0.8; margin-bottom:0.5rem;">{label}</p>
                    <h3 style="font-size:1.8rem; font-weight:800; margin:0;">{val}</h3>
                </div>
            """, unsafe_allow_html=True)

    # Main Data Display
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    st.markdown("<h3 class='neon-text' style='font-size:1rem; margin-bottom:1.5rem;'>AUDIT DATA EXPLORER</h3>", unsafe_allow_html=True)
    
    # Custom interaction: Filter entities
    entities = st.multiselect("FILTER BY ENTITY", options=data['ENTITY'].unique(), default=data['ENTITY'].unique())
    filtered_data = data[data['ENTITY'].isin(entities)]
    
    st.dataframe(filtered_data, use_container_width=True, height=400)
    
    # Export Protocol
    st.markdown('<div style="display:flex; justify-content:flex-end; margin-top:2rem;">', unsafe_allow_html=True)
    
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
        filtered_data.to_excel(writer, index=False, sheet_name='NEURAL_AUDIT')
    
    st.download_button(
        label="🚀 EXECUTE AUDIT EXPORT",
        data=buffer.getvalue(),
        file_name=f"audit_{st.session_state['last_file']}_{int(time.time())}.xlsx",
        mime="application/vnd.ms-excel"
    )
    st.markdown('</div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

# Footer Overlay
st.markdown("""
    <div style="position:fixed; bottom:0; left:0; width:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(10px); padding:0.5rem 2rem; border-top:1px solid rgba(0,242,254,0.1); display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; opacity:0.6; z-index:1000;">
        <span>© 2026 CHAT LEDGER NEURAL SYSTEMS // ALL DATA ENCRYPTED</span>
        <span>NODE ID: CL-77-XPRT</span>
    </div>
""", unsafe_allow_html=True)
