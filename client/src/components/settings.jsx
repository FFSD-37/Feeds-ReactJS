import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useUserData } from "../providers/userData.jsx";
import "../styles/settings.css";

const Modal = ({ children, onClose }) => {
    // ensure modal root exists
    const modalRootId = "modal-root";
    useEffect(() => {
        let root = document.getElementById(modalRootId);
        if (!root) {
            root = document.createElement("div");
            root.id = modalRootId;
            document.body.appendChild(root);
        }
        return () => {
            // don't remove root to avoid flicker if other modals used later
        };
    }, []);

    const root = document.getElementById(modalRootId) || document.body;

    // Inline styles (very defensive)
    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 2147483647, // extremely large to outrank anything
        pointerEvents: "auto",
    };

    const contentStyle = {
        backgroundColor: "#ffffff",
        padding: 24,
        borderRadius: 12,
        maxWidth: 420,
        width: "min(92%, 420px)",
        boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    };

    const portalContent = (
        <div
            className="modal-overlay"
            style={overlayStyle}
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
                // allow clicking outside to close
                if (e.target === e.currentTarget && typeof onClose === "function") {
                    onClose();
                }
            }}
        >
            <div className="modal-content" style={contentStyle}>
                {children}
            </div>
        </div>
    );

    return createPortal(portalContent, root);
};

const Settings = () => {
    const { userData: Meuser } = useUserData();

    const [blockedUsers, setBlockedUsers] = useState([]);
    const [isPublic, setIsPublic] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [basicDetails, setBasicDetails] = useState({});

    const fetchBasic = async (username) => {
        // console.log(username);
        const res = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/profile/getbasic/${username}`,
            {
                method: "GET",
                credentials: "include"
            },
        );
        const data = await res.json();
        if (data.success) {
            console.log(data.details);
            setBasicDetails(data.details);
        }
        else {
            console.log("ERROR");
        }
    }

    useEffect(() => {
        if (Meuser?.username) {
            fetchBasic(Meuser.username);
        }
    }, [Meuser]);


    // Load initial values
    useEffect(() => {
        if (basicDetails) {
            setIsPublic(basicDetails.visibility === "Public");
        }
    }, [Meuser]);

    // Lock scroll when modal open
    useEffect(() => {
        if (showModal) {
            // save current overflow
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prev || "";
            };
        }
    }, [showModal]);

    const handleToggle = () => setShowModal(true);

    const confirmToggle = () => {
        setShowModal(false);

        fetch("/togglePublicPrivate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then(() => window.location.reload())
            .catch(() => setIsPublic(!isPublic));
    };

    const cancelToggle = () => {
        setShowModal(false);
    };

    const unblockUser = (username) => {
        if (!window.confirm(`Are you sure you want to unblock ${username}?`)) return;

        fetch(`/block/${username}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    alert("Unblocked successfully");
                    setBlockedUsers((prev) => prev.filter((u) => u !== username));
                }
            })
            .catch((err) => console.error(err));
    };

    const shareProfile = () => {
        const url = `http://localhost:5173/profile/${Meuser.username}`;

        if (navigator.share) {
            navigator.share({ title: "My Profile", url }).catch(console.error);
        } else {
            alert("Share this URL: " + url);
        }
    };

    const copyProfileUrl = () => {
        navigator.clipboard
            .writeText(window.location.href)
            .then(() => alert("Profile URL copied!"))
            .catch(console.error);
    };

    if (!Meuser) return null;

    return (
        <>
            <div className="settings-page">
                <div className="settings-container">
                    {/* Header */}
                    <div className="settings-header">
                        <h1 className="settings-title">Settings</h1>
                        <p className="settings-subtitle">
                            Manage your account preferences and privacy settings
                        </p>
                    </div>

                    {/* Account Privacy Section */}
                    <div className="settings-section">
                        <div className="section-header">
                            <h2 className="section-title">
                                <svg
                                    className="section-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                Account Privacy
                            </h2>
                        </div>

                        <div className="section-content">
                            <div className="privacy-toggle-wrapper">
                                <div className="privacy-info-text">
                                    <h3 className="privacy-title">Public Profile</h3>
                                    <p className="privacy-description">
                                        Allow others to view your profile and activity
                                    </p>
                                </div>

                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={!isPublic}
                                        onChange={handleToggle}
                                        className="toggle-input"
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Blocked Users Section */}
                    <div className="settings-section">
                        <div className="section-header">
                            <h2 className="section-title">
                                <svg
                                    className="section-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    />
                                </svg>
                                Blocked Users
                            </h2>
                        </div>

                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-th">Username</th>
                                        <th className="table-th table-th-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {blockedUsers.length > 0 ? (
                                        blockedUsers.map((user, i) => (
                                            <tr key={i} className="table-row">
                                                <td className="table-td">
                                                    <span className="user-name">@{user}</span>
                                                </td>
                                                <td className="table-td table-td-right">
                                                    <button
                                                        onClick={() => unblockUser(user)}
                                                        className="btn-unblock"
                                                    >
                                                        <svg
                                                            className="btn-icon"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                        Unblock
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="empty-state">
                                                <div className="empty-state-content">
                                                    <svg
                                                        className="empty-icon"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                        />
                                                    </svg>
                                                    <p className="empty-text">No blocked users</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="settings-section">
                        <div className="section-header">
                            <h2 className="section-title">
                                <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Profile Sharing
                            </h2>
                        </div>
                        <div className="section-content">
                            <div className="button-group">
                                <button
                                    onClick={shareProfile}
                                    className="btn btn-primary"
                                >
                                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Share Profile
                                </button>

                                <button
                                    onClick={copyProfileUrl}
                                    className="btn btn-secondary"
                                >
                                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy Profile URL
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="settings-section">
                        <div className="section-header">
                            <h2 className="section-title">
                                <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Help & Support
                            </h2>
                        </div>
                        <div className="section-content">
                            <div className="button-group">
                                <a href="/help" className="btn btn-help">
                                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    Get Help
                                </a>
                                <a href="/activityLog" className="btn btn-secondary">
                                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Activity Log
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="settings-section">
                        <div className="section-header">
                            <h2 className="section-title">
                                <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Profile Information
                            </h2>
                        </div>

                        <div className="section-content">
                            <div className="profile-info-grid">

                                <div className="profile-info-card">
                                    <div className="profile-info-label">Username</div>
                                    <div className="profile-info-value">@{Meuser.username}</div>
                                </div>

                                <div className="profile-info-card">
                                    <div className="profile-info-label">Full Name</div>
                                    <div className="profile-info-value">{basicDetails.full_name}</div>
                                </div>

                                <div className="profile-info-card">
                                    <div className="profile-info-label">Email</div>
                                    <div className="profile-info-value">{Meuser.email}</div>
                                </div>

                                <div className="profile-info-card">
                                    <div className="profile-info-label">Member Since</div>
                                    <div className="profile-info-value">
                                        {new Date(basicDetails.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div className="profile-info-card">
                                    <div className="profile-info-label">Coins Balance</div>
                                    <div className="profile-info-value">{basicDetails.coins} coins</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 40 }} /> {/* small spacer */}
                </div>
            </div>

            {showModal && (
                <Modal onClose={cancelToggle}>
                    <h3 className="modal-title">Change Profile Visibility</h3>
                    <p className="modal-description">
                        Are you sure you want to{" "}
                        {!isPublic ? "make your profile private" : "make your profile public"}?
                    </p>
                    <div className="modal-buttons">
                        <button
                            onClick={cancelToggle}
                            className="modal-btn modal-btn-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmToggle}
                            className="modal-btn modal-btn-confirm"
                        >
                            Confirm
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default Settings;
