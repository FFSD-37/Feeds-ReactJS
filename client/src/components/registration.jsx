import React, { useEffect, useRef, useState } from "react";

export default function Register() {
  const initialValues = {
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acctype: "Normal",
    dob: "",
    profileImageUrl: "https://ik.imagekit.io/FFSD0037/default_user.png?updatedAt=1741701160385",
    bio: "",
    gender: "",
    terms: false,
  };

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(values.profileImageUrl);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [imageKitLoaded, setImageKitLoaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({
    password: false,
    confirmPassword: false
  });

  useEffect(() => {
    if (window.ImageKit) {
      setImageKitLoaded(true);
      return;
    }
    const id = "imagekit-js";
    if (document.getElementById(id)) {
      setImageKitLoaded(true);
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://unpkg.com/imagekit-javascript/dist/imagekit.min.js";
    s.onload = () => setImageKitLoaded(true);
    s.onerror = () => {
      console.warn("Failed to load ImageKit script.");
      setImageKitLoaded(false);
    };
    document.body.appendChild(s);
  }, []);

  const validateFullName = (name) =>
    name && name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);

  const validateUsername = (username) => /^[a-zA-Z0-9]{3,20}$/.test(username);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone) => /^\+?[\d\s-]{10,}$/.test(phone);

  const validatePassword = (password) =>
    password &&
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const validateDOB = (dobISO) => {
    if (!dobISO) return false;
    const date = new Date(dobISO);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
    const temp = values.acctype;
    if (temp === "Kids") {
      return age >= 2 && age <= 8;
    }
    return age >= 9 && age <= 120;
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({
      ...v,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const togglePasswordVisibility = (fieldName) => {
    setPasswordVisible(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const showAlert = (msg) => {
    setServerMsg(msg);
    setAlertVisible(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const authRes = await fetch("/imagKitauth");
      if (!authRes.ok) throw new Error("Failed to fetch imagekit auth");
      const authData = await authRes.json();

      if (!window.ImageKit) throw new Error("ImageKit is not loaded");

      const imagekit = new window.ImageKit({
        publicKey: authData.publicKey || "public_wbpheuS28ohGGR1W5QtPU+uv/z8=",
        urlEndpoint: authData.urlEndpoint || "https://ik.imagekit.io/lidyx2zxm/",
      });

      const uploadOptions = {
        file,
        fileName: file.name,
        token: authData.token,
        signature: authData.signature,
        expire: authData.expire,
      };

      imagekit.upload(uploadOptions, function (err, result) {
        setUploading(false);
        if (err) {
          console.error("ImageKit upload error", err);
          showAlert("Image upload failed. Try again.");
          setPreviewUrl(values.profileImageUrl);
          return;
        }
        setValues((v) => ({ ...v, profileImageUrl: result.url }));
        setPreviewUrl(result.url);
      });
    } catch (err) {
      console.error("Image upload flow error:", err);
      setUploading(false);
      showAlert("Image upload failed. Try again.");
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!validateFullName(values.fullName)) newErrors.fullName = true;
    if (!validateUsername(values.username)) newErrors.username = true;
    if (!validateEmail(values.email)) newErrors.email = true;
    if (!validatePhone(values.phone)) newErrors.phone = true;
    if (!validatePassword(values.password)) newErrors.password = true;
    if (values.password !== values.confirmPassword) newErrors.confirmPassword = true;
    if (!validateDOB(values.dob)) newErrors.dob = true;
    if (!values.gender) newErrors.gender = true;
    if (!values.terms) newErrors.terms = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showAlert("Please fix the errors highlighted in the form.");
      return;
    }

    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      formData.append(k, typeof v === "boolean" ? String(v) : v);
    });

    if (fileRef.current?.files?.[0]) {
      formData.append("pfp", fileRef.current.files[0]);
    }

    try {
      const res = await fetch("/signup", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data && data.success) {
        window.location.href = data.redirect || "/login";
      } else {
        showAlert(data.message || data.reason || "Signup failed. Try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      showAlert("An error occurred while creating account.");
    }
  };

  const groupClass = (field) => `form-group ${errors[field] ? "error" : ""}`;

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
      --success-bg: #d1fae5;
      --success-border: #a7f3d0;
      --text-primary: #0f172a;
      --text-secondary: #64748b;
      --text-muted: #94a3b8;
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --border: #e2e8f0;
      --border-focus: #c7d2fe;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
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
    
    .register-wrap {
      max-width: 680px;
      margin: 0 auto;
      padding: 40px 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .register-card {
      background: var(--bg-primary);
      border-radius: 24px;
      padding: 48px;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border);
      animation: fadeInUp 0.6s ease-out;
    }
    
    .register-header {
      text-align: center;
      margin-bottom: 36px;
    }
    
    .register-header h1 {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .register-header p {
      color: var(--text-secondary);
      font-size: 15px;
    }
    
    .register-header a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    
    .register-header a:hover {
      color: var(--primary-dark);
      text-decoration: underline;
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
    
    .alert.success {
      background: var(--success-bg);
      border-color: var(--success-border);
      color: var(--success);
    }
    
    .close-btn-alert {
      background: transparent;
      border: 0;
      font-size: 24px;
      cursor: pointer;
      color: inherit;
      padding: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: background 0.2s;
    }
    
    .close-btn-alert:hover {
      background: rgba(239, 68, 68, 0.1);
    }
    
    .form-scroll {
      max-height: 60vh;
      overflow-y: auto;
      padding-right: 12px;
      margin-bottom: 24px;
    }
    
    .form-scroll::-webkit-scrollbar {
      width: 8px;
    }
    
    .form-scroll::-webkit-scrollbar-track {
      background: var(--bg-secondary);
      border-radius: 10px;
    }
    
    .form-scroll::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 10px;
    }
    
    .form-scroll::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }
    
    .form-group {
      margin-bottom: 24px;
    }
    
    .form-group label {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
      display: block;
    }
    
    .input-wrapper {
      position: relative;
    }
    
    .form-group input:not([type="radio"]):not([type="checkbox"]),
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 14px 16px;
      border-radius: 12px;
      background: var(--bg-secondary);
      border: 2px solid var(--border);
      font-size: 15px;
      color: var(--text-primary);
      font-weight: 500;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
    }
    
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      background: var(--bg-primary);
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: var(--text-muted);
    }
    
    .form-group textarea {
      resize: vertical;
      min-height: 100px;
    }
    
    .password-toggle {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
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
    
    .error-message {
      color: var(--error);
      font-size: 13px;
      margin-top: 6px;
      display: none;
      font-weight: 500;
    }
    
    .form-group.error input:not([type="radio"]):not([type="checkbox"]),
    .form-group.error textarea,
    .form-group.error select {
      border-color: var(--error);
      background: var(--error-bg);
    }
    
    .form-group.error .error-message {
      display: block;
    }
    
    .radio-group {
      display: flex;
      gap: 16px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    
    .radio-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      cursor: pointer;
      padding: 10px 18px;
      background: var(--bg-secondary);
      border-radius: 10px;
      border: 2px solid var(--border);
      transition: all 0.2s ease;
    }
    
    .radio-group label:hover {
      border-color: var(--primary-light);
      background: rgba(99, 102, 241, 0.05);
    }
    
    .radio-group input[type="radio"]:checked + label,
    .radio-group label:has(input[type="radio"]:checked) {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
    }
    
    .radio-group input[type="radio"] {
      accent-color: var(--primary);
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    
    .checkbox-group {
      margin-top: 8px;
    }
    
    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
      cursor: pointer;
      color: var(--text-primary);
    }
    
    .checkbox-group input[type="checkbox"] {
      accent-color: var(--primary);
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    
    .checkbox-group a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
    
    .checkbox-group a:hover {
      text-decoration: underline;
    }
    
    .know-about-type {
      margin-top: 12px;
      text-align: center;
    }
    
    .know-about-type button {
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
    }
    
    .know-about-type button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
    }
    
    .profile-upload {
      margin-top: 12px;
      text-align: center;
    }
    
    .profile-preview {
      position: relative;
      display: inline-block;
      margin-top: 16px;
    }
    
    .preview-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--border);
      box-shadow: var(--shadow-lg);
    }
    
    .upload-btn-wrapper {
      position: relative;
      overflow: hidden;
      display: inline-block;
    }
    
    .upload-btn-wrapper input[type="file"] {
      position: absolute;
      left: -9999px;
    }
    
    .file-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--bg-secondary);
      border: 2px solid var(--border);
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      color: var(--text-primary);
      transition: all 0.2s ease;
    }
    
    .file-label:hover {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.05);
      color: var(--primary);
    }
    
    .uploading-text {
      color: var(--primary);
      font-size: 14px;
      margin-top: 8px;
      font-weight: 500;
    }
    
    .submit-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.4);
    }
    
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px 0 rgba(99, 102, 241, 0.5);
    }
    
    .submit-btn:active {
      transform: translateY(0);
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-out;
    }
    
    .overlay-content {
      background: var(--bg-primary);
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.3s ease-out;
    }
    
    .overlay-close {
      position: absolute;
      top: 20px;
      right: 20px;
      background: var(--error);
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .overlay-close:hover {
      background: #dc2626;
      transform: rotate(90deg);
    }
    
    .overlay-content h1 {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 24px;
    }
    
    .overlay-content h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
      margin-top: 24px;
      margin-bottom: 12px;
    }
    
    .overlay-content p {
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 12px;
    }
    
    .overlay-content ul {
      margin-left: 24px;
      margin-bottom: 12px;
    }
    
    .overlay-content li {
      color: var(--text-secondary);
      line-height: 1.8;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @media (max-width: 768px) {
      .register-wrap {
        padding: 24px 16px;
      }
      
      .register-card {
        padding: 32px 24px;
      }
      
      .register-header h1 {
        font-size: 28px;
      }
      
      .form-scroll {
        max-height: 50vh;
      }
      
      .overlay-content {
        margin: 20px;
        padding: 32px 24px;
        max-width: calc(100% - 40px);
      }
      
      .radio-group {
        flex-direction: column;
      }
    }
  `;

  return (
    <div className="register-wrap">
      <style>{styles}</style>
      
      <div className="register-card">
        {alertVisible && (
          <div className="alert" role="alert">
            <div>{serverMsg}</div>
            <button className="close-btn-alert" onClick={() => setAlertVisible(false)}>
              ×
            </button>
          </div>
        )}

        <div className="register-header">
          <h1>Create Account</h1>
          <p>
            Already Registered? <a href="/login">Login here</a>
          </p>
        </div>

        <div className="form-scroll">
          <div className={groupClass("fullName")}>
            <label htmlFor="fullName">Full Name</label>
            <input
              name="fullName"
              id="fullName"
              placeholder="Enter your full name"
              value={values.fullName}
              onChange={onChange}
            />
            <div className="error-message">Please enter your full name (letters only, 2+ characters)</div>
          </div>

          <div className={groupClass("username")}>
            <label htmlFor="username">Username</label>
            <input
              name="username"
              id="username"
              placeholder="Choose a unique username"
              value={values.username}
              onChange={onChange}
            />
            <div className="error-message">Username must be 3-20 characters, letters and numbers only</div>
          </div>

          <div className={groupClass("email")}>
            <label htmlFor="email">Email Address</label>
            <input
              name="email"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={onChange}
            />
            <div className="error-message">Please enter a valid email address</div>
          </div>

          <div className={groupClass("phone")}>
            <label htmlFor="phone">Phone Number</label>
            <input
              name="phone"
              id="phone"
              placeholder="+1 234 567 8900"
              value={values.phone}
              onChange={onChange}
            />
            <div className="error-message">Please enter a valid phone number (10+ digits)</div>
          </div>

          <div className={groupClass("password")}>
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                name="password"
                id="password"
                type={passwordVisible.password ? "text" : "password"}
                placeholder="Create a strong password"
                value={values.password}
                onChange={onChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility("password")}
              >
                {passwordVisible.password ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
            <div className="error-message">Password must be 6+ characters with uppercase, number, and special character</div>
          </div>

          <div className={groupClass("confirmPassword")}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                name="confirmPassword"
                id="confirmPassword"
                type={passwordVisible.confirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={values.confirmPassword}
                onChange={onChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility("confirmPassword")}
              >
                {passwordVisible.confirmPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
            <div className="error-message">Passwords must match</div>
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="acctype"
                  value="Kids"
                  checked={values.acctype === "Kids"}
                  onChange={onChange}
                />
                Kids (2-8 years)
              </label>
              <label>
                <input
                  type="radio"
                  name="acctype"
                  value="Normal"
                  checked={values.acctype === "Normal"}
                  onChange={onChange}
                />
                Normal (9+ years)
              </label>
            </div>
            <div className="know-about-type">
              <button
                type="button"
                onClick={() =>
                  alert(
                    "1. Kids: Age should be 2 to 8 years\n2. Normal: Age should be greater than 8"
                  )
                }
              >
                Not sure about the type?
              </button>
            </div>
          </div>

          <div className={groupClass("dob")}>
            <label htmlFor="dob">Date of Birth</label>
            <input
              name="dob"
              id="dob"
              type="date"
              value={values.dob}
              onChange={onChange}
            />
            <div className="error-message">Age criteria must match the selected account type</div>
          </div>

          <div className="form-group">
            <label>Profile Picture (Optional)</label>
            <div className="profile-upload">
              <div className="upload-btn-wrapper">
                <label htmlFor="pfp" className="file-label">
                  📷 Choose Image
                </label>
                <input
                  ref={fileRef}
                  name="pfp"
                  id="pfp"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              {uploading && <div className="uploading-text">Uploading image...</div>}
              {previewUrl && (
                <div className="profile-preview">
                  <img src={previewUrl} className="preview-image" alt="Profile Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio (Optional)</label>
            <textarea
              name="bio"
              id="bio"
              rows="4"
              placeholder="Tell us a bit about yourself..."
              value={values.bio}
              onChange={onChange}
            />
          </div>

          <div className={groupClass("gender")}>
            <label>Gender</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={values.gender === "Male"}
                  onChange={onChange}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={values.gender === "Female"}
                  onChange={onChange}
                />
                Female
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={values.gender === "Other"}
                  onChange={onChange}
                />
                Other
              </label>
            </div>
            <div className="error-message">Please select your gender</div>
          </div>

          <div className={groupClass("terms") + " checkbox-group"}>
            <label>
              <input
                type="checkbox"
                name="terms"
                checked={values.terms}
                onChange={onChange}
              />
              I agree to the{" "}
              <a
                href="#"
                onClick={(ev) => {
                  ev.preventDefault();
                  setShowOverlay(true);
                }}
              >
                Terms & Conditions
              </a>
            </label>
            <div className="error-message">You must agree to the terms and conditions</div>
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          Create Account
        </button>
      </div>

      {showOverlay && (
        <div className="overlay">
          <div className="overlay-content">
            <button className="overlay-close" onClick={() => setShowOverlay(false)}>
              ×
            </button>
            <h1>Terms & Conditions</h1>
            
            <h2>1. Introduction</h2>
            <p>
              Welcome to Feeds! By using our platform, you agree to these terms and
              conditions.
            </p>

            <h2>2. User Responsibilities</h2>
            <ul>
              <li>You must be at least 13 years old to use this platform.</li>
              <li>Do not post offensive or illegal content.</li>
              <li>Respect other users and maintain a friendly environment.</li>
            </ul>

            <h2>3. Privacy & Data</h2>
            <p>
              We collect user data only for improving our services. Your personal
              details will not be shared without consent.
            </p>

            <h2>4. Payments</h2>
            <p>
              All payments for premium features are handled securely via Razorpay.
            </p>

            <h2>5. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Continued use
              of the platform means you accept the new terms.
            </p>

            <p>
              <strong>Last Updated: February 2025</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}