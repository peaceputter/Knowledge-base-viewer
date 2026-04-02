import streamlit as st
import sqlite3
import os
from datetime import datetime
import time

JSX_FILE = "current.jsx"
DB = "comments.db"
OWNER_PASSWORD = "admin123"  # change this

# --- SESSION STATE INIT ---
if "uploading" not in st.session_state:
    st.session_state.uploading = False

# --- AUTO REFRESH (disabled during upload) ---
if not st.session_state.uploading:
    try:
        from streamlit_autorefresh import st_autorefresh
        st_autorefresh(interval=2000, key="refresh")
    except:
        pass

# --- DB SETUP ---
conn = sqlite3.connect(DB, check_same_thread=False)
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    timestamp TEXT,
    resolved INTEGER DEFAULT 0
)
""")
conn.commit()

st.set_page_config(layout="wide")
st.title("UI Preview + Feedback")

# --- OWNER UPLOAD ---
with st.expander("🔒 Owner Upload"):
    pwd = st.text_input("Enter password", type="password")

    if pwd == OWNER_PASSWORD:
        uploaded = st.file_uploader("Upload JSX", type=["jsx"])  # ✅ NO dynamic key

        if uploaded is not None:
            st.session_state.uploading = True  # stop refresh

            with open(JSX_FILE, "wb") as f:
                f.write(uploaded.read())

            st.success("JSX updated")
            st.write("File size:", os.path.getsize(JSX_FILE))  # debug

            st.session_state.uploading = False  # resume refresh
            st.rerun()

    elif pwd:
        st.error("Wrong password")

# --- LAYOUT ---
col1, col2 = st.columns([2, 1])

# --- PREVIEW ---
with col1:
    st.subheader("Preview")

    if os.path.exists(JSX_FILE):
        with open(JSX_FILE, "r") as f:
            jsx_code = f.read()

        # Debug (remove later if you want)
        st.code(jsx_code[:300])

        html = f"""
        <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body {{ font-family: sans-serif; padding: 16px; }}
          </style>
        </head>
        <body>
          <div id="root"></div>

          <script type="text/babel">
          try {{
            const Component = {jsx_code}
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<Component />);
          }} catch (e) {{
            document.body.innerHTML = "<pre style='color:red'>" + e + "</pre>"
          }}
          </script>

          <div style="display:none">{time.time()}</div>
        </body>
        </html>
        """

        st.components.v1.html(
            html,
            height=650,
            scrolling=True
        )

        if st.button("🔄 Refresh Preview"):
            st.rerun()

    else:
        st.warning("No JSX file uploaded")

# --- COMMENTS PANEL ---
with col2:
    st.subheader("Comments")

    new_comment = st.text_area("Add feedback")

    if st.button("Post Comment"):
        if new_comment.strip():
            c.execute(
                "INSERT INTO comments (text, timestamp, resolved) VALUES (?, ?, 0)",
                (new_comment, str(datetime.now()))
            )
            conn.commit()
            st.rerun()

    st.divider()

    rows = c.execute(
        "SELECT id, text, timestamp, resolved FROM comments ORDER BY id DESC"
    ).fetchall()

    for cid, text, ts, resolved in rows:
        status = "✅ Resolved" if resolved else "🟡 Open"

        with st.container():
            st.markdown(f"**{status} — 🕒 {ts}**")
            st.write(text)

            colA, colB = st.columns(2)

            if colA.button(
                "Resolve" if not resolved else "Unresolve",
                key=f"resolve_{cid}"
            ):
                c.execute(
                    "UPDATE comments SET resolved = ? WHERE id = ?",
                    (0 if resolved else 1, cid)
                )
                conn.commit()
                st.rerun()

            if colB.button("Delete", key=f"delete_{cid}"):
                c.execute("DELETE FROM comments WHERE id = ?", (cid,))
                conn.commit()
                st.rerun()

        st.divider()
