import React, { useState, useEffect, useRef } from "react";
import ImageKit from "imagekit-javascript";
import "./../styles/editProfile.css";

function EditProfile() {
  const [edit_profile_user, set_edit_profile_user] = useState({});
  const [edit_profile_photo, set_edit_profile_photo] = useState("");
  const [edit_profile_preview, set_edit_profile_preview] = useState("");
  const [edit_profile_termsVisible, set_edit_profile_termsVisible] = useState(false);
  const overlayRef = useRef(null);
  const [editableFields, setEditableFields] = useState({});

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/edit_profile`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch user details");

        const data = await res.json();
        const { CurrentUser } = data;

        set_edit_profile_user({
          username: CurrentUser.username,
          fullName: CurrentUser.fullName || "",
          display_name: CurrentUser.display_name || "",
          bio: CurrentUser.bio || "",
          gender: CurrentUser.gender || "",
          phone: CurrentUser.phone || "",
          profilePicture: CurrentUser.profilePicture || "",
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserData();
  }, []);

  const imagekit = new ImageKit({
    publicKey: "public_HU6D7u4KBDv1yJ7t6dpVw2PVDxQ=",
    urlEndpoint: "https://ik.imagekit.io/your_imagekit_id",
    authenticationEndpoint: `${import.meta.env.VITE_SERVER_URL}/api/imagekit/auth`,
  });

  const edit_profile_enableField = (field) => {
    setEditableFields((prev) => ({ ...prev, [field]: true }));
  };

  // 📸 Handle photo change & preview
  const edit_profile_handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set_edit_profile_photo(file);
    set_edit_profile_preview(URL.createObjectURL(file));
  };

  // ❌ Close terms overlay when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        set_edit_profile_termsVisible(false);
      }
    };
    if (edit_profile_termsVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [edit_profile_termsVisible]);

  // 💾 Handle form submit with visual feedback
  const edit_profile_handleSubmit = async (e) => {
    e.preventDefault();
    let edit_profile_profileImageUrl = "";
    setIsSaving(true);

    try {
      if (edit_profile_photo) {
        const uploadResponse = await imagekit.upload({
          file: edit_profile_photo,
          fileName: edit_profile_photo.name,
        });
        edit_profile_profileImageUrl = uploadResponse.url;
      }

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/updateUserDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          photo: edit_profile_photo ? "yes" : "",
          profileImageUrl: edit_profile_profileImageUrl,
          display_name: edit_profile_user.display_name,
          name: edit_profile_user.fullName,
          bio: edit_profile_user.bio,
          gender: edit_profile_user.gender,
          phone: edit_profile_user.phone,
          terms: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      // ✅ Visual confirmation
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="edit-profile_container">
      <h2 className="edit-profile_heading">Edit Profile</h2>

      <form className="edit-profile_form" onSubmit={edit_profile_handleSubmit}>
        {/* Profile Photo */}
        <div className="edit-profile_photo-section">
          <img
            src={edit_profile_preview || edit_profile_user.profilePicture || "/default-avatar.png"}
            alt="Profile"
            className="edit-profile_photo"
            onClick={() => document.getElementById("edit-profile_photoInput").click()}
          />
          <input
            type="file"
            id="edit-profile_photoInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={edit_profile_handlePhoto}
          />
          <button
            type="button"
            className="edit-profile_photo-btn"
            onClick={() => document.getElementById("edit-profile_photoInput").click()}
          >
            Change Photo
          </button>
        </div>

        {/* Display Name */}
        <h4>Display Name</h4>
        <div className="edit-profile_field">
          <input
            type="text"
            value={edit_profile_user.display_name || ""}
            readOnly={!editableFields.display_name}
            onChange={(e) =>
              set_edit_profile_user({ ...edit_profile_user, display_name: e.target.value })
            }
          />
          <a onClick={() => edit_profile_enableField("display_name")}>EDIT</a>
        </div>

        {/* Name */}
        <h4>Name</h4>
        <div className="edit-profile_field">
          <input
            type="text"
            value={edit_profile_user.fullName || ""}
            readOnly={!editableFields.fullName}
            onChange={(e) =>
              set_edit_profile_user({ ...edit_profile_user, fullName: e.target.value })
            }
          />
          <a onClick={() => edit_profile_enableField("fullName")}>EDIT</a>
        </div>

        {/* Bio */}
        <h4>Bio</h4>
        <div className="edit-profile_field">
          <textarea
            rows="3"
            value={edit_profile_user.bio || ""}
            readOnly={!editableFields.bio}
            onChange={(e) => set_edit_profile_user({ ...edit_profile_user, bio: e.target.value })}
          />
          <a onClick={() => edit_profile_enableField("bio")}>EDIT</a>
        </div>

        {/* Gender */}
        <h4>Gender</h4>
        <div className="edit-profile_field">
          <select
            value={edit_profile_user.gender || ""}
            onChange={(e) =>
              set_edit_profile_user({ ...edit_profile_user, gender: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Phone */}
        <h4>Phone Number</h4>
        <div className="edit-profile_field">
          <input
            type="text"
            value={edit_profile_user.phone || ""}
            readOnly={!editableFields.phone}
            onChange={(e) =>
              set_edit_profile_user({ ...edit_profile_user, phone: e.target.value })
            }
          />
          <a onClick={() => edit_profile_enableField("phone")}>EDIT</a>
        </div>

        {/* Terms */}
        <div className="edit-profile_terms">
          <label>
            <input type="checkbox" required /> I agree to the{" "}
            <span
              className="edit-profile_terms-link"
              onClick={() => set_edit_profile_termsVisible(true)}
            >
              Terms & Conditions
            </span>
          </label>
        </div>

        <button
          type="submit"
          className={`edit-profile_submit-btn ${saved ? "saved" : ""}`}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
        </button>

        {saved && (
          <p className="edit-profile_success-msg">Profile updated successfully!</p>
        )}
      </form>

      {/* Terms Overlay */}
      {edit_profile_termsVisible && (
        <div className="edit-profile_overlay">
          <div className="edit-profile_overlay-content" ref={overlayRef}>
            <button
              className="edit-profile_close-btn"
              onClick={() => set_edit_profile_termsVisible(false)}
            >
              X
            </button>
            <h1>Terms & Conditions</h1>
            <div className="edit-profile_overlay-text">
              <h2>1. Introduction</h2>
              <p>
                Welcome to Feeds! By using our platform, you agree to these terms and conditions.
              </p>

              <h2>2. User Responsibilities</h2>
              <ul>
                <li>You must be at least 13 years old to use this platform.</li>
                <li>Do not post offensive or illegal content.</li>
                <li>Respect other users and maintain a friendly environment.</li>
              </ul>

              <h2>3. Privacy & Data</h2>
              <p>
                We collect user data only for improving our services. Your personal details will
                not be shared without consent.
              </p>

              <h2>4. Payments</h2>
              <p>All payments for premium features are handled securely via Razorpay.</p>

              <h2>5. Changes to Terms</h2>
              <p>
                We reserve the right to update these terms at any time. Continued use of the
                platform means you accept the new terms.
              </p>

              <p>
                <strong>Last Updated: February 2025</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfile;
