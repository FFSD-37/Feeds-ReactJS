import React, { useEffect, useState } from "react";

export default function Login() {
  const [role, setRole] = useState("normal");
  const [identifierMode, setIdentifierMode] = useState("email");
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

  const handleSubmit = async () => {
    const payload = {};
    if (role === "kids") {
      payload.childEmail = values.childEmail;
      payload.parentPassword = values.parentPassword;
      payload.userTypeiden = "parent";
    } else if (role === "normal") {
      payload.identifier = values.identifier;
      payload.password = values.password;
      payload.userTypeiden = identifierMode === "username" ? "Username" : "Email";
    } else if (role === "channel") {
      payload.channelName = values.channelName;
      payload.adminName = values.adminName;
      payload.channelPassword = values.channelPassword;
      payload.userTypeiden = "channel";
    }

    payload.type = roleTitle[role];
    console.log(payload);

    try {
      const res = await fetch("http://localhost:3000/atin_job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      const data = await res.json();
      if (data && data.success) {
        if (data.redirect) window.location.href = data.redirect;
        else window.location.href = "/home";
      } else {
        setServerMessage((data && data.reason) || "Login failed. Please check credentials.");
        setShowAlert(true);
      }
    } catch (err) {
      console.error("Login error:", err);
      setServerMessage("An error occurred. Please try again.");
      setShowAlert(true);
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    :root {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --primary-light: #818cf8;
      --error: #ef4444;
      --error-bg: #fef2f2;
      --error-border: #fecaca;
      --success: #10b981;
      --text-primary: #0f172a;
      --text-secondary: #022131ff;
      --text-muted: #94a3b8;
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --bg-tertiary: #f1f5f9;
      --border: #e2e8f0;
      --border-focus: #c7d2fe;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .login-wrap {
      max-width: 1100px;
      margin: 0 auto;
      padding: 40px 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .heading {
      text-align: center;
      margin-bottom: 40px;
      animation: fadeInDown 0.6s ease-out;
    }
    
    .heading h1 {
      font-size: 42px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    
    .heading p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-weight: 500;
    }
    
    .roles {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      max-width: 860px;
      margin: 0 auto 40px;
      animation: fadeIn 0.8s ease-out 0.2s both;
    }
    
    .role {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 24px;
      cursor: pointer;
      border: 2px solid transparent;
      box-shadow: var(--shadow-lg);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    
    .role::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--primary-light));
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    .role:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
      border-color: var(--border-focus);
    }
    
    .role.active {
      border-color: var(--primary);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(129, 140, 248, 0.05) 100%);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), var(--shadow-xl);
    }
    
    .role.active::before {
      transform: scaleX(1);
    }
    
    .role .icon {
      font-size: 32px;
      margin-bottom: 12px;
      display: block;
    }
    
    .role .title {
      font-weight: 700;
      font-size: 18px;
      color: var(--text-primary);
      margin-bottom: 6px;
    }
    
    .role .desc {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    
    .card {
      max-width: 480px;
      margin: 0 auto;
      background: var(--bg-primary);
      border-radius: 24px;
      padding: 48px;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border);
      animation: fadeInUp 0.8s ease-out 0.4s both;
    }
    
    .card h2 {
      text-align: center;
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 32px;
    }
    
    .field-group {
      margin-bottom: 24px;
    }
    
    .label {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
      display: block;
    }
    
    .field {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 12px;
      background: var(--bg-secondary);
      border: 2px solid var(--border);
      transition: all 0.2s ease;
    }
    
    .field:focus-within {
      background: var(--bg-primary);
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .field input {
      border: 0;
      background: transparent;
      outline: 0;
      width: 100%;
      font-size: 15px;
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .field input::placeholder {
      color: var(--text-muted);
    }
    
    .hint {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 8px;
      line-height: 1.5;
    }
    
    .toggle-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .toggle-group {
      display: inline-flex;
      gap: 6px;
      background: var(--bg-secondary);
      padding: 4px;
      border-radius: 10px;
      border: 1px solid var(--border);
    }
    
    .toggle-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }
    
    .toggle-btn.active {
      background: var(--bg-primary);
      color: var(--primary);
      box-shadow: var(--shadow-sm);
    }
    
    .toggle-btn:hover:not(.active) {
      color: var(--text-primary);
    }
    
    .submit {
      margin-top: 32px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: #fff;
      padding: 16px;
      border-radius: 12px;
      border: none;
      width: 100%;
      cursor: pointer;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.4);
      transition: all 0.3s ease;
    }
    
    .submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px 0 rgba(99, 102, 241, 0.5);
    }
    
    .submit:active {
      transform: translateY(0);
    }
    
    .alert {
      background: var(--error-bg);
      border-radius: 12px;
      padding: 16px 20px;
      border: 1px solid var(--error-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      color: var(--error);
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    }
    
    .closebtn {
      background: transparent;
      border: 0;
      font-size: 24px;
      cursor: pointer;
      color: var(--error);
      padding: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: background 0.2s;
    }
    
    .closebtn:hover {
      background: rgba(239, 68, 68, 0.1);
    }
    
    .password-toggle {
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: 20px;
      padding: 4px;
      display: flex;
      align-items: center;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    
    .password-toggle:hover {
      opacity: 1;
    }
    
    .footer-links {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }
    
    .footer-links a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    
    .footer-links a:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }
    
    .footer-links .secondary-text {
      color: var(--text-secondary);
      font-size: 14px;
      margin-top: 12px;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @media (max-width: 768px) {
      .login-wrap {
        padding: 24px 16px;
      }
      
      .heading h1 {
        font-size: 32px;
      }
      
      .card {
        padding: 32px 24px;
      }
      
      .roles {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `;

  const roleIcons = {
    kids: "👶",
    normal: "👤",
    channel: "📺"
  };

  return (
    <div className="login-wrap">
      <style>{styles}</style>

      <div className="heading">
        <h1>Welcome Back</h1>
        <p>Select your account type to continue</p>
      </div>

      <div className="roles">
        <div
          className={`role ${role === "kids" ? "active" : ""}`}
          onClick={() => setRole("kids")}
          tabIndex={0}
        >
          <span className="icon">{roleIcons.kids}</span>
          <div className="title">Child Account</div>
          <div className="desc">Restricted portal with guardian approval</div>
        </div>

        <div
          className={`role ${role === "normal" ? "active" : ""}`}
          onClick={() => setRole("normal")}
          tabIndex={0}
        >
          <span className="icon">{roleIcons.normal}</span>
          <div className="title">Standard Account</div>
          <div className="desc">Personal login for all users</div>
        </div>

        <div
          className={`role ${role === "channel" ? "active" : ""}`}
          onClick={() => setRole("channel")}
          tabIndex={0}
        >
          <span className="icon">{roleIcons.channel}</span>
          <div className="title">Channel Account</div>
          <div className="desc">Manage communications and teams</div>
        </div>
      </div>

      <div className="card" role="region" aria-labelledby="loginHeading">
        {showAlert && (
          <div className="alert" role="alert">
            <div>{serverMessage}</div>
            <button className="closebtn" onClick={() => setShowAlert(false)}>
              ×
            </button>
          </div>
        )}

        <h2 id="loginHeading">{roleTitle[role]} Login</h2>

        <div>
          {role === "kids" && (
            <>
              <div className="field-group">
                <label className="label" htmlFor="childEmail">
                  Child Email Address
                </label>
                <div className="field">
                  <input
                    id="childEmail"
                    name="childEmail"
                    type="email"
                    placeholder="child@example.com"
                    value={values.childEmail}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="label" htmlFor="parentPassword">
                  Guardian Password
                </label>
                <div className="field">
                  <input
                    id="parentPassword"
                    name="parentPassword"
                    type={visiblePasswords.parentPassword ? "text" : "password"}
                    placeholder="Enter guardian password"
                    value={values.parentPassword}
                    onChange={onChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("parentPassword")}
                  >
                    {visiblePasswords.parentPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
                <div className="hint">
                  A parent or guardian password is required for access.
                </div>
              </div>
            </>
          )}

          {role === "normal" && (
            <>
              <div className="field-group">
                <div className="toggle-wrapper">
                  <label className="label">Login With</label>
                  <div className="toggle-group">
                    <button
                      type="button"
                      className={`toggle-btn ${identifierMode === "email" ? "active" : ""}`}
                      onClick={() => setIdentifierMode("email")}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${identifierMode === "username" ? "active" : ""}`}
                      onClick={() => setIdentifierMode("username")}
                    >
                      Username
                    </button>
                  </div>
                </div>

                <div className="field">
                  <input
                    name="identifier"
                    type={identifierMode === "username" ? "text" : "email"}
                    placeholder={
                      identifierMode === "username"
                        ? "Enter your username"
                        : "you@example.com"
                    }
                    value={values.identifier}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="label">Password</label>
                <div className="field">
                  <input
                    name="password"
                    type={visiblePasswords.password ? "text" : "password"}
                    placeholder="Enter your password"
                    value={values.password}
                    onChange={onChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("password")}
                  >
                    {visiblePasswords.password ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
              </div>
            </>
          )}

          {role === "channel" && (
            <>
              <div className="field-group">
                <label className="label" htmlFor="channelName">
                  Channel Name
                </label>
                <div className="field">
                  <input
                    id="channelName"
                    name="channelName"
                    type="text"
                    placeholder="Enter channel name"
                    value={values.channelName}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="label" htmlFor="adminName">
                  Admin Name
                </label>
                <div className="field">
                  <input
                    id="adminName"
                    name="adminName"
                    type="text"
                    placeholder="Enter admin name"
                    value={values.adminName}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="label" htmlFor="channelPassword">
                  Password
                </label>
                <div className="field">
                  <input
                    id="channelPassword"
                    name="channelPassword"
                    type={visiblePasswords.channelPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={values.channelPassword}
                    onChange={onChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("channelPassword")}
                  >
                    {visiblePasswords.channelPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
                <div className="hint">
                  Admin credentials are required to manage channel settings.
                </div>
              </div>
            </>
          )}

          <button className="submit" onClick={handleSubmit}>
            Sign In
          </button>
        </div>

        <div className="footer-links">
          <a href="/forget-password">Forgot password?</a>
          <div className="secondary-text">
            Don't have an account? <a href="/signup">Sign up here</a>
          </div>
        </div>
      </div>
    </div>
  );
}