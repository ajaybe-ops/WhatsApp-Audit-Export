# ===============================
# IMPORTS
# ===============================
import streamlit as st
import pandas as pd
import re
import io
import time
from datetime import datetime

# ===============================
# PAGE CONFIG
# ===============================
st.set_page_config(
    page_title="CHAT LEDGER | NEURAL AUDIT",
    page_icon="🌌",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ===============================
# GLOBAL CSS (GLASS + FUTURISTIC)
# ===============================
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

* {
    font-family: 'Space Grotesk', sans-serif !important;
}

.main {
    background: radial-gradient(circle at top right, #0a0a12 0%, #050505 100%);
    color: #e0e0e0;
}

/* Glass Card */
.glass-card {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.7);
}

/* Neon Text */
.neon-text {
    letter-spacing: 4px;
    background: linear-gradient(90deg, #00f2fe, #4facfe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
}

/* Buttons */
.stButton > button {
    background: linear-gradient(45deg, #4facfe, #00f2fe);
    color: black;
    border: none;
    border-radius: 40px;
    padding: 0.7rem 2rem;
    font-weight: 700;
    letter-spacing: 2px;
    transition: all 0.3s ease;
}

.stButton > button:hover {
    transform: scale(1.05);
}

/* Hide Streamlit chrome */
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# ===============================
# PARTICLE BACKGROUND (DEPTH)
# ===============================
st.components.v1.html("""
<canvas id="bg" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;"></canvas>
<script>
const c = document.getElementById('bg');
const ctx = c.getContext('2d');
let w,h,particles=[];

function resize(){
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
}
window.onresize = resize;
resize();

for(let i=0;i<90;i++){
  particles.push({
    x:Math.random()*w,
    y:Math.random()*h,
    vx:(Math.random()-0.5)*0.4,
    vy:(Math.random()-0.5)*0.4,
    r:Math.random()*2
  });
}

function draw(){
  ctx.clearRect(0,0,w,h);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0||p.x>w) p.vx*=-1;
    if(p.y<0||p.y>h) p.vy*=-1;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle="rgba(0,242,254,0.35)";
    ctx.fill();
  });
  requestAnimationFrame(draw);
}
draw();
</script>
""", height=0)

# ===============================
# DATA PARSER (DETERMINISTIC)
# ===============================
def process_audit_stream(raw_text: str) -> pd.DataFrame:
    ios_regex = r'^\[?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},? \d{1,2}:\d{2}(?: [AP]M)?)\]? (.*?): (.*)'
    android_regex = r'^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},? \d{1,2}:\d{2}) - (.*?): (.*)'

    messages = []
    current = None

    for line in raw_text.splitlines():
        line = line.strip()
        if not line:
            continue

        ios = re.match(ios_regex, line)
        android = re.match(android_regex, line)

        if ios or android:
            if current:
                messages.append(current)

            ts, sender, content = (ios or android).groups()
            current = {
                "TIMESTAMP": ts,
                "ENTITY": sender,
                "CONTENT": content,
                "FIDELITY": "VERIFIED",
                "METADATA": "Protocol Match"
            }
        else:
            if current:
                current["CONTENT"] += " " + line
                current["FIDELITY"] = "LIKELY"
            else:
                messages.append({
                    "TIMESTAMP": "UNKNOWN",
                    "ENTITY": "SYSTEM_X",
                    "CONTENT": line,
                    "FIDELITY": "UNVERIFIABLE",
                    "METADATA": "Orphan Line"
                })

    if current:
        messages.append(current)

    return pd.DataFrame(messages)

# ===============================
# HEADER
# ===============================
st.markdown("""
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3rem;">
<h1 class="neon-text">CHAT LEDGER // V2</h1>
<div style="opacity:0.7;">SYSTEM STATUS: ONLINE</div>
</div>
""", unsafe_allow_html=True)

# ===============================
# MAIN UI
# ===============================
with st.container():
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)

    st.markdown("""
    <h2 style="text-align:center;">SECURE AUDIT NODE</h2>
    <p style="text-align:center;opacity:0.6;">WhatsApp Deterministic Parser</p>
    """, unsafe_allow_html=True)

    file = st.file_uploader("Upload TXT", type=["txt"])

    if file:
        raw = file.read().decode("utf-8")

        if st.button("INITIALIZE NEURAL PARSING"):
            bar = st.progress(0)
            for i in range(100):
                bar.progress(i+1)
                time.sleep(0.01)

            st.session_state.data = process_audit_stream(raw)
            st.session_state.filename = file.name

    st.markdown('</div>', unsafe_allow_html=True)

# ===============================
# RESULTS
# ===============================
if "data" in st.session_state:
    df = st.session_state.data

    c1, c2, c3 = st.columns(3)
    c1.metric("TOTAL RECORDS", len(df))
    c2.metric("VERIFIED", len(df[df["FIDELITY"]=="VERIFIED"]))
    c3.metric("SYSTEM_X", len(df[df["ENTITY"]=="SYSTEM_X"]))

    st.markdown('<div class="glass-card">', unsafe_allow_html=True)

    entities = st.multiselect(
        "Filter Entities",
        options=df["ENTITY"].unique(),
        default=df["ENTITY"].unique()
    )

    filtered = df[df["ENTITY"].isin(entities)]
    st.dataframe(filtered, use_container_width=True)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="xlsxwriter") as writer:
        filtered.to_excel(writer, index=False)

    st.download_button(
        "EXPORT EXCEL",
        buffer.getvalue(),
        file_name=f"audit_{int(time.time())}.xlsx"
    )

    st.markdown('</div>', unsafe_allow_html=True)

# ===============================
# FOOTER
# ===============================
st.markdown("""
<div style="position:fixed;bottom:0;width:100%;text-align:center;
background:rgba(0,0,0,0.6);padding:0.5rem;font-size:0.7rem;opacity:0.6;">
© 2026 CHAT LEDGER NEURAL SYSTEMS
</div>
""", unsafe_allow_html=True)
