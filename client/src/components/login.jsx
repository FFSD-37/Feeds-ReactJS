import React, { useEffect, useState } from "react";

export default function Login() {
  const [role, setRole] = useState("normal"); // 'kids' | 'normal' | 'channel'
  const [identifierMode, setIdentifierMode] = useState("email"); // 'email' | 'username'
  const [serverMessage, setServerMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [values, setValues] = useState({
    childEmail: "",
    parentPassword: "",
    identifier: "",
    password: "",
    channelName: "",
    adminName: "",
    channelPassword: ""
  });

  const [visiblePasswords, setVisiblePasswords] = useState({
    parentPassword: false,
    password: false,
    channelPassword: false
  });

  const roleTitle = {
    kids: "Child Account",
    normal: "Standard Account",
    channel: "Channel Account"
  };

  useEffect(() => {
    if (role !== "normal") setIdentifierMode("email");
    setShowAlert(false);
    setServerMessage("");
  }, [role]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((s) => ({ ...s, [name]: value }));
  };

  const togglePasswordVisibility = (key) => {
    setVisiblePasswords((s) => ({ ...s, [key]: !s[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // prepare payload to match handleloginsecond
    const payload = {};
    if (role === "kids") {
      payload.childEmail = values.childEmail;
      payload.parentPassword = values.parentPassword;
      payload.userTypeiden = "parent"; // optional metadata for server readability
    } else if (role === "normal") {
      payload.identifier = values.identifier;
      payload.password = values.password;
      payload.userTypeiden = identifierMode === "username" ? "Username" : "Email"; // IMPORTANT capitalization
    } else if (role === "channel") {
      payload.channelName = values.channelName;
      payload.adminName = values.adminName;
      payload.channelPassword = values.channelPassword;
      payload.userTypeiden = "channel";
    }

    payload.type = roleTitle[role];
    console.log(payload)

    try {
      const res = await fetch("http://localhost:3000/atin_job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include" // ensure cookies set by backend are stored
      });

      const data = await res.json();
      // console.log(data)
      if (data && data.success) {
        // server may set cookies (uuid / cuid) — redirect to home or provided redirect
        if (data.redirect) window.location.href = data.redirect;
        else window.location.href = "/home";
      } else {
        setServerMessage((data && data.reason) || "Login failed. Please check credentials.");
        setShowAlert(true);

        // Optional: clear sensitive fields on failure (uncomment if desired)
        // setValues(v => ({ ...v, password: "", parentPassword: "", channelPassword: "" }));
      }
    } catch (err) {
      console.error("Login error:", err);
      setServerMessage("An error occurred. Please try again.");
      setShowAlert(true);
    }
  };

  const styles = `
    :root{ --accent: #432fff; --muted:#7b7f86; }
    *{box-sizing:border-box}
    .login-wrap{max-width:980px;margin:24px auto;padding:32px 20px;font-family:Inter,Arial,Helvetica,sans-serif;}
    .heading{text-align:center;margin-bottom:24px}
    .heading h1{font-size:32px;margin:0;font-weight:800}
    .heading p{color:var(--muted);margin-top:8px}
    .roles{display:flex;gap:18px;justify-content:center;margin:24px 0 32px}
    .role{background:#fff;border-radius:12px;padding:18px 24px;min-width:200px;cursor:pointer;border:2px solid transparent;box-shadow:0 8px 24px rgba(35,45,80,0.06);display:flex;flex-direction:column;gap:6px}
    .role.active{border-color:var(--accent);background:linear-gradient(180deg,rgba(67,47,255,0.06),rgba(67,47,255,0.03))}
    .role .title{font-weight:600}
    .role .desc{font-size:13px;color:var(--muted)}
    .card{width:420px;margin:0 auto;background:#fff;border-radius:12px;padding:34px;box-shadow:0 18px 40px rgba(32,40,80,0.06);border:1px solid rgba(0,0,0,0.04)}
    .card h2{text-align:center;margin:8px 0 18px;font-weight:700}
    .field{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:#f8f9fb;border:1px solid rgba(15,20,40,0.07)}
    .field input{border:0;background:transparent;outline:0;width:100%;font-size:14px;padding:6px 0}
    .label{font-size:13px;color:#666;margin-bottom:6px;display:block}
    .hint{font-size:12px;color:var(--muted);margin-top:6px}
    .toggle-group{display:flex;gap:8px}
    .toggle-btn{padding:6px 12px;border-radius:999px;border:1px solid rgba(15,20,40,0.14);background:#f7f8fb;cursor:pointer;font-weight:600;color:var(--muted)}
    .toggle-btn.active{background:#f0f6ff;border-color:rgba(24,42,180,0.12);color:#222}
    .submit{margin-top:12px;background:linear-gradient(180deg,var(--accent),#2d299b);color:#fff;padding:12px;border-radius:8px;border:0;width:100%;cursor:pointer;font-weight:700}
    .alert{background:#fff3f0;border-radius:8px;padding:12px 14px;border:1px solid #f5d6d0;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .closebtn{background:transparent;border:0;font-size:16px;cursor:pointer}
    .password-toggle{background:transparent;border:0;cursor:pointer;font-size:16px}
    @media(max-width:600px){ .card{width:92%;padding:20px} .roles{flex-direction:column;gap:12px} }
  `;

  return (
    <div className="login-wrap">
      <style>{styles}</style>

      <div className="heading">
        <h1>Welcome Back</h1>
        <p>Select your login type below</p>
      </div>

      {showAlert && (
        <div className="alert" role="alert">
          <div>{serverMessage}</div>
          <button className="closebtn" onClick={() => setShowAlert(false)}>&times;</button>
        </div>
      )}

      <div className="roles">
        <div className={`role ${role === "kids" ? "active" : ""}`} onClick={() => setRole("kids")} tabIndex={0}>
          <div className="title">Child Account</div>
          <div className="desc">Restricted portal with guardian approval</div>
        </div>

        <div className={`role ${role === "normal" ? "active" : ""}`} onClick={() => setRole("normal")} tabIndex={0}>
          <div className="title">Standard Account</div>
          <div className="desc">Personal login for all users</div>
        </div>

        <div className={`role ${role === "channel" ? "active" : ""}`} onClick={() => setRole("channel")} tabIndex={0}>
          <div className="title">Channel Account</div>
          <div className="desc">Manage communications and teams</div>
        </div>
      </div>

      <div className="card" role="region" aria-labelledby="loginHeading">
        <h2 id="loginHeading">{roleTitle[role]} Login</h2>

        <form onSubmit={handleSubmit} noValidate>
          {role === "kids" && (
            <>
              <label className="label" htmlFor="childEmail">Child Email</label>
              <div className="field">
                <input id="childEmail" name="childEmail" type="email" placeholder="child@domain.com" value={values.childEmail} onChange={onChange} required />
              </div>

              <label className="label" htmlFor="parentPassword">Guardian Password</label>
              <div className="field">
                <input id="parentPassword" name="parentPassword" type={visiblePasswords.parentPassword ? "text" : "password"} placeholder="Parent / Guardian password" value={values.parentPassword} onChange={onChange} required />
                <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("parentPassword")}>
                  {visiblePasswords.parentPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
              <div className="hint">A parent or guardian password is required for access.</div>
            </>
          )}

          {role === "normal" && (
            <>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <label className="label">Login Identifier</label>
                <div className="toggle-group" style={{marginLeft:8}}>
                  <button type="button" className={`toggle-btn ${identifierMode === "email" ? "active" : ""}`} onClick={() => setIdentifierMode("email")}>Email</button>
                  <button type="button" className={`toggle-btn ${identifierMode === "username" ? "active" : ""}`} onClick={() => setIdentifierMode("username")}>Username</button>
                </div>
              </div>

              <div className="field" style={{marginTop:6}}>
                <input name="identifier" type={identifierMode === "username" ? "text" : "email"} placeholder={identifierMode === "username" ? "your_username" : "user@domain.com"} value={values.identifier} onChange={onChange} required />
              </div>

              <label className="label">Password</label>
              <div className="field">
                <input name="password" type={visiblePasswords.password ? "text" : "password"} placeholder="Enter your password" value={values.password} onChange={onChange} required />
                <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("password")}>
                  {visiblePasswords.password ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>

              <div className="hint">Sign in using either your email address or username.</div>
            </>
          )}

          {role === "channel" && (
            <>
              <label className="label" htmlFor="channelName">Channel Name</label>
              <div className="field">
                <input id="channelName" name="channelName" type="text" placeholder="Channel name" value={values.channelName} onChange={onChange} required />
              </div>

              <label className="label" htmlFor="adminName">Admin Name</label>
              <div className="field">
                <input id="adminName" name="adminName" type="text" placeholder="Admin full name" value={values.adminName} onChange={onChange} required />
              </div>

              <label className="label" htmlFor="channelPassword">Password</label>
              <div className="field">
                <input id="channelPassword" name="channelPassword" type={visiblePasswords.channelPassword ? "text" : "password"} placeholder="Enter password" value={values.channelPassword} onChange={onChange} required />
                <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("channelPassword")}>
                  {visiblePasswords.channelPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>

              <div className="hint">Admin credentials are required to manage channel settings.</div>
            </>
          )}

          <button className="submit" type="submit">Sign In</button>
        </form>

        <div style={{textAlign:"center", marginTop:12}}>
          <a href="/forget-password" style={{color:"#3651c9", textDecoration:"none"}}>Forgot password?</a>
        </div>
        <div style={{textAlign:"center", marginTop:8, color:"var(--muted)"}}>
          No account yet? <a href="/signup" style={{color:"#3651c9"}}>Sign up here</a>
        </div>
      </div>
    </div>
  );
}
