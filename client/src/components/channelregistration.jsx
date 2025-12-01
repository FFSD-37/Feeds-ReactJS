import React, { useEffect, useRef, useState } from 'react';
// import './styles.css';

const PLACEHOLDER_IMAGE_PATH = '/mnt/data/e479b996-dc06-436e-b39d-4bca279897fd.jpg';

const DEFAULT_CATEGORIES = [
  'All', 'Education', 'Animations', 'Games', 'Memes', 'News', 'Tech',
  'Vlog', 'Entertainment', 'Sports', 'Nature', 'Music', 'Marketing',
  'Fitness', 'Lifestyle',
];

export default function ChannelRegistration() {
  const [channelName, setChannelName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [pfpFile, setPfpFile] = useState(null);
  const [channelDescription, setChannelDescription] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [serverMsg, setServerMsg] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.ImageKit) return;
    const id = 'imagekit-js';
    if (document.getElementById(id)) return;
    const s = document.createElement('script');
    s.id = id;
    s.src = 'https://unpkg.com/imagekit-javascript/dist/imagekit.min.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const validatePassword = p =>
    p.length >= 6 &&
    /[A-Z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(p);

  const showFieldError = (field, flag) =>
    setErrors(prev => ({ ...prev, [field]: !!flag }));

  async function handlePfpChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPfpFile(file);
    setProfileImageUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const authRes = await fetch('/imagKitauth', { credentials: 'include' });
      if (!authRes.ok) throw new Error('Auth fetch failed');
      const authData = await authRes.json();

      if (!window.ImageKit) throw new Error('ImageKit not loaded');

      const imagekit = new window.ImageKit({
        publicKey: authData.publicKey || 'public_wbpheuS28ohGGR1W5QtPU+uv/z8=',
        urlEndpoint: authData.urlEndpoint || 'https://ik.imagekit.io/lidyx2zxm/',
      });

      imagekit.upload(
        {
          file,
          fileName: file.name,
          token: authData.token,
          signature: authData.signature,
          expire: authData.expire,
        },
        (err, result) => {
          setUploading(false);
          if (err) {
            console.error('ImageKit upload error', err);
            setServerMsg('Image upload failed. Please try again.');
            return;
          }
          setProfileImageUrl(result.url);
        },
      );
    } catch (err) {
      console.error('Image upload error', err);
      setUploading(false);
      setServerMsg('Failed to upload image. Please try again.');
    }
  }

  const toggleCategory = val => {
    setSelectedCategories(prev => {
      if (val === 'All') {
        if (prev.includes('All')) {
          return prev.filter(v => v !== 'All');
        }
        return ['All'];
      }
      
      const withoutAll = prev.filter(v => v !== 'All');
            if (withoutAll.includes(val)) {
        return withoutAll.filter(v => v !== val);
      } else {
        return [...withoutAll, val];
      }
    });
  };

  const filteredCategories = DEFAULT_CATEGORIES.filter(c =>
    c.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setServerMsg('');

    const pwValid = validatePassword(password);
    const pwMatch = password === confirmPassword;
    const nameValid = channelName && channelName.trim().length >= 2;
    const termsValid = termsChecked;

    showFieldError('channelName', !nameValid);
    showFieldError('password', !pwValid);
    showFieldError('confirmPassword', !pwMatch);
    showFieldError('terms', !termsValid);

    if (!nameValid || !pwValid || !pwMatch || !termsValid) {
      setServerMsg('Please fix the highlighted fields.');
      return;
    }

    const formData = new FormData();
    formData.append('channelName', channelName);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('selectedCategories', JSON.stringify(selectedCategories));
    formData.append('channelDescription', channelDescription);
    formData.append('terms', String(termsChecked));
    if (profileImageUrl) formData.append('profileImageUrl', profileImageUrl);
    if (pfpFile) formData.append('pfp', pfpFile);

    try {
      const res = await fetch('/signupChannel', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          window.location.href = data.redirect || '/channels';
          return;
        } else {
          setServerMsg(data.reason || data.message || 'Registration failed');
          return;
        }
      } else {
        if (res.redirected) {
          window.location.href = res.url;
        } else if (res.ok) {
          window.location.href = '/channels';
        } else {
          setServerMsg('Registration failed');
        }
      }
    } catch (err) {
      console.error('submit error', err);
      setServerMsg('An error occurred. Please try again.');
    }
  }

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 5px 20px;
        }

        .registration-wrapper {
        
          width: 800px;
          margin: 0 auto;
        }

        .registration-card {
          background: #ffffff;
          width: 800px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .card-header {
          background: linear-gradient(135deg, #92a0deff 0%, #b18ad8ff 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }

        .card-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .card-header p {
          font-size: 16px;
          opacity: 0.95;
          font-weight: 400;
        }

        .card-body {
          padding: 40px;
        }

        .alert {
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fee;
          border-left: 4px solid #dc3545;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert-text {
          color: #dc3545;
          font-size: 14px;
          font-weight: 500;
        }

        .alert .close-btn {
          background: transparent;
          border: none;
          color: #dc3545;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .alert .close-btn:hover {
          background: rgba(220, 53, 69, 0.1);
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #2d3748;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.3px;
        }

        .form-group input:not([type="checkbox"]),
        .form-group textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: #f8fafc;
          color: #2d3748;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
          font-family: inherit;
        }

        .password-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: #718096;
          font-size: 20px;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          color: #667eea;
        }

        .form-group.error input,
        .form-group.error textarea {
          border-color: #dc3545;
          background: #fff5f5;
        }

        .error-message {
          color: #dc3545;
          font-size: 13px;
          margin-top: 6px;
          display: none;
          font-weight: 500;
        }

        .form-group.error .error-message {
          display: block;
        }

        .image-upload-section {
          background: #f8fafc;
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s;
        }

        .image-upload-section:hover {
          border-color: #667eea;
          background: #f7fafc;
        }

        .image-preview {
          margin-top: 16px;
        }

        .image-preview img {
          max-width: 160px;
          max-height: 160px;
          border-radius: 12px;
          border: 3px solid #e2e8f0;
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .upload-status {
          color: #667eea;
          font-size: 14px;
          margin-top: 12px;
          font-weight: 500;
        }

        .multiselect-dropdown {
          position: relative;
        }

        .select-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 52px;
        }

        .select-box:hover {
          border-color: #cbd5e0;
        }

        .select-box.open {
          border-color: #667eea;
          background: #ffffff;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .selected-items {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          flex: 1;
        }

        .selected-item {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .selected-item .remove-btn {
          background: rgba(255, 255, 255, 0.3);
          border: none;
          color: white;
          cursor: pointer;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: background 0.2s;
          padding: 0;
          margin: 0;
        }

        .selected-item .remove-btn:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .placeholder {
          color: #a0aec0;
          font-size: 15px;
        }

        .dropdown-arrow {
          color: #718096;
          transition: transform 0.3s ease;
          margin-left: 12px;
        }

        .dropdown-content {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 320px;
          overflow-y: auto;
          background: white;
          border: 2px solid #667eea;
          border-top: none;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          display: none;
        }

        .dropdown-content.show {
          display: block;
        }

        .search-box {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          sticky: top 0;
        }

        .search-input {
          width: 100%;
          padding: 10px 14px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .options {
          list-style: none;
          padding: 8px;
        }

        .option {
          padding: 12px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 8px;
          transition: background 0.2s;
          font-size: 14px;
        }

        .option:hover {
          background: #f7fafc;
        }

        .option.selected {
          background: #eef2ff;
          color: #667eea;
          font-weight: 500;
        }

        .option input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #667eea;
        }

        .no-options {
          padding: 24px;
          text-align: center;
          color: #a0aec0;
          font-size: 14px;
        }

        .checkbox-group {
          margin: 24px 0;
        }

        .checkbox-group label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          font-size: 14px;
          color: #4a5568;
        }

        .checkbox-group input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #667eea;
          margin-top: 2px;
        }

        .checkbox-group a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .checkbox-group a:hover {
          text-decoration: underline;
        }

        .checkbox-group.error label {
          color: #dc3545;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
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
          background: rgba(0, 0, 0, 0.7);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        .overlay.show {
          display: flex;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .overlay-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
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

        .overlay-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px 30px;
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .overlay-header h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .overlay .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .overlay .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .overlay-body {
          padding: 30px;
        }

        .overlay-body h2 {
          color: #2d3748;
          font-size: 20px;
          margin: 24px 0 12px 0;
          font-weight: 600;
        }

        .overlay-body h3 {
          color: #4a5568;
          font-size: 16px;
          margin: 16px 0 8px 0;
          font-weight: 600;
        }

        .overlay-body p {
          color: #718096;
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .overlay-body pre {
          background: #f7fafc;
          padding: 12px 16px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
          margin: 12px 0;
          font-size: 14px;
          color: #2d3748;
        }

        @media (max-width: 768px) {
          .card-body {
            padding: 24px 20px;
          }

          .card-header {
            padding: 30px 20px;
          }

          .card-header h1 {
            font-size: 26px;
          }

          .overlay-content {
            max-width: 95%;
          }
        }
      `}</style>

      <div className="registration-wrapper">
        <div className="registration-card">
          <div className="card-header">
            <h1>Create Your Channel</h1>
            <p>Start your content creation journey today</p>
          </div>

          <div className="card-body">
            {serverMsg && (
              <div className="alert">
                <div className="alert-text">{serverMsg}</div>
                <button className="close-btn" onClick={() => setServerMsg('')}>
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className={`form-group ${errors.channelName ? 'error' : ''}`}>
                <label htmlFor="channelName">Channel Name</label>
                <input
                  id="channelName"
                  type="text"
                  placeholder="Enter your channel name"
                  value={channelName}
                  onChange={e => setChannelName(e.target.value)}
                  required
                />
                <div className="error-message">
                  Please enter a unique channel name (minimum 2 characters)
                </div>
              </div>

              <div className={`form-group ${errors.password ? 'error' : ''}`}>
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
                <div className="error-message">
                  Password must be 6+ characters with uppercase, number, and special character
                </div>
              </div>

              <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
                <div className="error-message">
                  Passwords must match
                </div>
              </div>

              <div className="form-group">
                <label>Select Categories</label>
                <div ref={dropdownRef} className="multiselect-dropdown">
                  <div
                    className={`select-box ${dropdownOpen ? 'open' : ''}`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setDropdownOpen(!dropdownOpen);
                      }
                    }}
                  >
                    <div className="selected-items">
                      {selectedCategories.length === 0 ? (
                        <span className="placeholder">Choose your content categories...</span>
                      ) : (
                        selectedCategories.map(v => (
                          <div key={v} className="selected-item">
                            <span>{v}</span>
                            <button
                              type="button"
                              className="remove-btn"
                              onClick={ev => {
                                ev.stopPropagation();
                                toggleCategory(v);
                              }}
                              aria-label={`Remove ${v}`}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <span
                      className="dropdown-arrow"
                      style={{
                        transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▼
                    </span>
                  </div>

                  <div className={`dropdown-content ${dropdownOpen ? 'show' : ''}`}>
                    <div className="search-box">
                      <input
                        className="search-input"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                    <ul className="options">
                      {filteredCategories.length === 0 ? (
                        <div className="no-options">No categories found</div>
                      ) : (
                        filteredCategories.map(opt => (
                          <li
                            key={opt}
                            className={`option ${selectedCategories.includes(opt) ? 'selected' : ''}`}
                            onClick={ev => {
                              ev.stopPropagation();
                              toggleCategory(opt);
                            }}
                            role="option"
                            aria-selected={selectedCategories.includes(opt)}
                            tabIndex={0}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleCategory(opt);
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              readOnly
                              checked={selectedCategories.includes(opt)}
                            />
                            <span>{opt}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="pfp">Channel Logo</label>
                <div className="image-upload-section">
                  <input
                    ref={fileInputRef}
                    id="pfp"
                    type="file"
                    accept="image/*"
                    onChange={handlePfpChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Choose Image
                  </button>
                  {uploading && (
                    <div className="upload-status">Uploading your logo...</div>
                  )}
                  <div className="image-preview">
                    <img
                      src={profileImageUrl || PLACEHOLDER_IMAGE_PATH}
                      alt="Channel logo preview"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="channelDescription">Channel Description</label>
                <textarea
                  id="channelDescription"
                  placeholder="Tell viewers what your channel is about..."
                  value={channelDescription}
                  onChange={e => setChannelDescription(e.target.value)}
                  required
                />
              </div>

              <div className={`checkbox-group ${errors.terms ? 'error' : ''}`}>
                <label>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsChecked}
                    onChange={e => setTermsChecked(e.target.checked)}
                  />
                  <span>
                    I agree to the{' '}
                    <a
                      href="#"
                      onClick={ev => {
                        ev.preventDefault();
                        setShowOverlay(true);
                      }}
                    >
                      Terms & Conditions
                    </a>
                  </span>
                </label>
                <div className="error-message">You must agree to the terms and conditions</div>
              </div>

              <button type="submit" className="submit-btn">
                Create Channel
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className={`overlay ${showOverlay ? 'show' : ''}`}>
        <div className="overlay-content">
          <div className="overlay-header">
            <h1>Terms & Conditions</h1>
            <button className="close-btn" onClick={() => setShowOverlay(false)}>
              ×
            </button>
          </div>
          <div className="overlay-body">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Feeds! By using our platform, you agree to these terms
              and conditions. Please read them carefully before creating your channel.
            </p>

            <h2>2. User Category Information</h2>
            
            <h3>Kids Category</h3>
            <pre>1. Education
2. Animation
3. Nature</pre>

            <h3>Students Category</h3>
            <pre>All categories available</pre>

            <h2>3. Content Guidelines</h2>
            <p>
              All content must comply with our community guidelines and applicable laws.
              Creators are responsible for ensuring their content is appropriate for their
              selected categories.
            </p>

            <p style={{ marginTop: '24px', fontWeight: '600', color: '#2d3748' }}>
              Last Updated: February 2025
            </p>
          </div>
        </div>
      </div>
    </>
  );
}