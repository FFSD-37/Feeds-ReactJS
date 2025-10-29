import React, { useEffect, useRef, useState } from "react";
import "./../styles/register.css";
import "./../styles/alert.css";

export default function Register() {
  const initialValues = {
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acctype: "Normal", // default
    dob: "",
    profileImageUrl:
      "https://ik.imagekit.io/FFSD0037/default_user.png?updatedAt=1741701160385",
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

  // load imagekit script (if not already present)
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

  // Validators (kept the same logic as original)
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
    // For Normal accounts require age >= 9 (matches your latest reg.ejs messaging)
    return age >= 9 && age <= 120;
  };

  // helper to set form value
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({
      ...v,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // toggles for password visibility: we will manage via CSS classless buttons inside inputs
  const togglePasswordVisibility = (fieldName) => {
    // simple approach: flip an attribute on the input element
    // But we keep track of toggles by state so re-renders keep correct state
    setValues((v) => ({
      ...v,
      // no store for visibility in values: we will use DOM toggle below
    }));

    const input = document.querySelector(`input[name="${fieldName}"]`);
    const toggleBtn = input && input.parentElement.querySelector(".password-toggle");
    if (!input || !toggleBtn) return;
    if (input.type === "password") {
      input.type = "text";
      toggleBtn.textContent = "👁️‍🗨️";
    } else {
      input.type = "password";
      toggleBtn.textContent = "👁️";
    }
  };

  // show server alert helper
  const showAlert = (msg) => {
    setServerMsg(msg);
    setAlertVisible(true);
  };

  // image upload handler (uses ImageKit client-side upload)
  const handleImageChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // optimistic preview
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

      // server returned token,signature,expire
      const uploadOptions = {
        file,
        fileName: file.name,
        token: authData.token,
        signature: authData.signature,
        expire: authData.expire,
        // optional tags/responseFields
      };

      imagekit.upload(uploadOptions, function (err, result) {
        setUploading(false);
        if (err) {
          console.error("ImageKit upload error", err);
          showAlert("Image upload failed. Try again.");
          // fallback preview to default
          setPreviewUrl(values.profileImageUrl);
          return;
        }
        // result.url has the uploaded URL
        setValues((v) => ({ ...v, profileImageUrl: result.url }));
        setPreviewUrl(result.url);
      });
    } catch (err) {
      console.error("Image upload flow error:", err);
      setUploading(false);
      showAlert("Image upload failed. Try again.");
    }
  };

  // validation & submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    // run validators
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

    // if any errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      showAlert("Please fix the errors highlighted in the form.");
      return;
    }

    // submit the form — original used normal form submit, we will POST FormData (same fields)
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      // boolean to string for terms
      formData.append(k, typeof v === "boolean" ? String(v) : v);
    });

    // if user selected pfp file and imagekit didn't handle upload (should), we still include file
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
        // redirect or show success
        window.location.href = data.redirect || "/login";
      } else {
        showAlert(data.message || data.reason || "Signup failed. Try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      showAlert("An error occurred while creating account.");
    }
  };

  // small helper to build className for group
  const groupClass = (field) => `form-group ${errors[field] ? "error" : ""}`;

  return (
    <div className="register-container" style={{ maxWidth: 600, margin: "32px auto" }}>
      {/* Server / client alerts */}
      {alertVisible && (
        <div className="alert" role="alert" style={{ display: "flex", marginBottom: 12 }}>
          <div className="alert-text">{serverMsg}</div>
          <span className="close-btn" onClick={() => setAlertVisible(false)}>&times;</span>
        </div>
      )}

      <div className="register-header">
        <h1>Create Account</h1>
        <p>
          Already Registered? <a href="/login" style={{ color: "black" }}>login</a>
        </p>
      </div>

      <form id="registerForm" onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
        <div className={groupClass("fullName")}>
          <label htmlFor="fullName">Full Name</label>
          <input name="fullName" id="fullName" placeholder="Full name" value={values.fullName} onChange={onChange} required />
          <div className="error-message">Please enter your full name</div>
        </div>

        <div className={groupClass("username")}>
          <label htmlFor="username">Username</label>
          <input name="username" id="username" placeholder="Fancy Username" value={values.username} onChange={onChange} required />
          <div className="error-message">Username must be 3-20 characters, letters and numbers only</div>
        </div>

        <div className={groupClass("email")}>
          <label htmlFor="email">Email</label>
          <input name="email" id="email" type="email" placeholder="Email" value={values.email} onChange={onChange} required />
          <div className="error-message">Please enter a valid email address</div>
        </div>

        <div className={groupClass("phone")}>
          <label htmlFor="phone">Phone Number</label>
          <input name="phone" id="phone" placeholder="Mobile number" value={values.phone} onChange={onChange} required />
          <div className="error-message">Please enter a valid phone number</div>
        </div>

        <div className={groupClass("password")} style={{ position: "relative" }}>
          <label htmlFor="password">Password</label>
          <input name="password" id="password" type="password" placeholder="Password" value={values.password} onChange={onChange} required />
          <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("password")} aria-label="Toggle password visibility">👁️</button>
          <div className="error-message">Password should be valid</div>
        </div>

        <div className={groupClass("confirmPassword")} style={{ position: "relative" }}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input name="confirmPassword" id="confirmPassword" type="password" placeholder="Password crosscheck" value={values.confirmPassword} onChange={onChange} required />
          <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("confirmPassword")} aria-label="Toggle password visibility">👁️</button>
          <div className="error-message">Password should match</div>
        </div>

        <div className="form-group">
          <label>Account Type</label>
          <div className="radio-group">
            <label>
              <input type="radio" name="acctype" value="Kids" checked={values.acctype === "Kids"} onChange={onChange} required />
              Kids
            </label>
            <label>
              <input type="radio" name="acctype" value="Normal" checked={values.acctype === "Normal"} onChange={onChange} />
              Normal
            </label>
          </div>
          <div className="know-about-type">
            <button type="button" onClick={() => alert("1. Kids : Age should be 2 to 8 years\n2. Normal : Age should be greater than 8\n")}>Not sure about the type ?</button>
          </div>
        </div>

        <div className={groupClass("dob")}>
          <label htmlFor="dob">Date of Birth</label>
          <input name="dob" id="dob" type="date" value={values.dob} onChange={onChange} required />
          <div className="error-message">Age criteria should match with the account type</div>
        </div>

        <input type="hidden" name="profileImageUrl" id="profileImageUrl" value={values.profileImageUrl} />

        <div className="form-group">
          <label htmlFor="pfp">Profile Picture (Optional)</label>
          <input ref={fileRef} name="pfp" id="pfp" type="file" accept="image/*" onChange={handleImageChange} />
          {uploading ? <div style={{ fontSize: 13, marginTop: 6 }}>Uploading image…</div> : null}
          {previewUrl && <img src={previewUrl} className="preview-image" alt="Preview" style={{ display: "block", marginTop: 8 }} />}
        </div>

        <div className="form-group">
          <label htmlFor="bio">A Short Bio (Optional)</label>
          <textarea name="bio" id="bio" rows="4" placeholder="Write your bio here..." style={{ resize: "none" }} value={values.bio} onChange={onChange} />
        </div>

        <div className={groupClass("gender")}>
          <label>Gender</label>
          <div className="radio-group">
            <label>
              <input type="radio" name="gender" value="Male" checked={values.gender === "Male"} onChange={onChange} required />
              Male
            </label>
            <label>
              <input type="radio" name="gender" value="Female" checked={values.gender === "Female"} onChange={onChange} />
              Female
            </label>
            <label>
              <input type="radio" name="gender" value="Other" checked={values.gender === "Other"} onChange={onChange} />
              Other
            </label>
          </div>
          <div className="error-message">Please select your gender</div>
        </div>

        <div className={groupClass("terms") + " checkbox-group"}>
          <label>
            <input type="checkbox" name="terms" checked={values.terms} onChange={onChange} required />
            I agree to the <a href="#" onClick={(ev) => { ev.preventDefault(); setShowOverlay(true); }}>Terms & Conditions</a>
          </label>
          <div className="error-message">You must agree to the terms</div>
        </div>

        <button type="submit" className="submit-btn">Create Account</button>
      </form>

      {/* Overlay Modal */}
      <div className={`overlay ${showOverlay ? "show-overlay" : ""}`} id="overlay" role="dialog" aria-modal="true" style={{ display: showOverlay ? "block" : "none" }}>
        <button className="close-btn" onClick={() => setShowOverlay(false)}>X</button>
        <h1>Terms & Conditions</h1>
        <div className="content" style={{ marginTop: 8 }}>
          <h2>1. Introduction</h2>
          <p>Welcome to Feeds! By using our platform, you agree to these terms and conditions.</p>

          <h2>2. User Responsibilities</h2>
          <ul>
            <li>You must be at least 13 years old to use this platform.</li>
            <li>Do not post offensive or illegal content.</li>
            <li>Respect other users and maintain a friendly environment.</li>
          </ul>

          <h2>3. Privacy & Data</h2>
          <p>We collect user data only for improving our services. Your personal details will not be shared without consent.</p>

          <h2>4. Payments</h2>
          <p>All payments for premium features are handled securely via Razorpay.</p>

          <h2>5. Changes to Terms</h2>
          <p>We reserve the right to update these terms at any time. Continued use of the platform means you accept the new terms.</p>

          <p><strong>Last Updated: February 2025</strong></p>
        </div>
      </div>
    </div>
  );
}
