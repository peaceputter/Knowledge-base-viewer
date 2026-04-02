import streamlit as st
import sqlite3
import os
from datetime import datetime

JSX_FILE = "current.jsx"
DB = "comments.db"

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

# --- LAYOUT ---
col1, col2 = st.columns([2, 1])

# --- PREVIEW ---
with col1:
    st.subheader("Preview")

    if os.path.exists(JSX_FILE):
        with open(JSX_FILE, "r") as f:
            jsx_code = f.read()

        # --- PROCESS JSX ---
        clean_jsx = "\n".join([
            line for line in jsx_code.split("\n")
            if not line.strip().startswith("import")
        ])
        clean_jsx = clean_jsx.replace("export default", "")

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
            const {{ useState, useEffect, useCallback }} = React;

            {clean_jsx}

            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<ArcOpsKB />);
          }} catch (e) {{
            document.body.innerHTML = "<pre style='color:red'>" + e + "</pre>";
          }}
          </script>
        </body>
        </html>
        """

        st.components.v1.html(html, height=700, scrolling=True)

    else:
        st.warning("No JSX file found")

# --- COMMENTS ---
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
