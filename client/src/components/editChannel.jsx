import React, { useState, useEffect, useRef } from "react";
import ImageKit from "imagekit-javascript";
import "./../styles/editChannel.css";

function EditChannel() {
  const [edit_channel_data, set_edit_channel_data] = useState({});
  const [edit_channel_logo, set_edit_channel_logo] = useState("");
  const [edit_channel_preview, set_edit_channel_preview] = useState("");
  const [edit_channel_termsVisible, set_edit_channel_termsVisible] = useState(false);
  const overlayRef = useRef(null);
  const [editableFields, setEditableFields] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [edit_channel_categories, set_edit_channel_categories] = useState([]);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/edit_channel`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch channel details");

        const data = await res.json();
        const { CurrentChannel } = data;

        set_edit_channel_data({
          channelName: CurrentChannel.channelName,
          channelDescription: CurrentChannel.channelDescription || "",
          channelLogo: CurrentChannel.channelLogo || "",
          channelCategory: CurrentChannel.channelCategory || [],
        });

        set_edit_channel_categories(CurrentChannel.channelCategory || []);
      } catch (error) {
        console.error("Error fetching channel details:", error);
      }
    };

    fetchChannelData();
  }, []);

  const imagekit = new ImageKit({
    publicKey: "public_HU6D7u4KBDv1yJ7t6dpVw2PVDxQ=",
    urlEndpoint: "https://ik.imagekit.io/your_imagekit_id",
    authenticationEndpoint: `${import.meta.env.VITE_SERVER_URL}/api/imagekit/auth`,
  });

  const edit_channel_enableField = (field) => {
    setEditableFields((prev) => ({ ...prev, [field]: true }));
  };

  const edit_channel_handleLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set_edit_channel_logo(file);
    set_edit_channel_preview(URL.createObjectURL(file));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        set_edit_channel_termsVisible(false);
      }
    };
    if (edit_channel_termsVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [edit_channel_termsVisible]);

  const edit_channel_handleCategoryToggle = (category) => {
    set_edit_channel_categories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const edit_channel_handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let edit_channel_logoUrl = "";

    try {
      if (edit_channel_logo) {
        const uploadResponse = await imagekit.upload({
          file: edit_channel_logo,
          fileName: edit_channel_logo.name,
        });
        edit_channel_logoUrl = uploadResponse.url;
      }

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/updateChannelDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          logo: edit_channel_logo ? "yes" : "",
          logoUrl: edit_channel_logoUrl,
          channelDescription: edit_channel_data.channelDescription,
          channelCategory: edit_channel_categories,
        }),
      });

      if (!response.ok) throw new Error("Failed to update channel");

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Error updating channel:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const allCategories = [
    "All", "Entertainment", "Education", "Animations", "Games", "Memes",
    "News", "Tech", "Vlog", "Sports", "Nature", "Music", "Marketing", "Fitness", "Lifestyle"
  ];

  return (
    <div className="edit_channel_container">
      <h2 className="edit_channel_heading">Edit Channel</h2>

      <form className="edit_channel_form" onSubmit={edit_channel_handleSubmit}>
        {/* Channel Logo */}
        <div className="edit_channel_logo-section">
          <img
            src={edit_channel_preview || edit_channel_data.channelLogo || "/Images/default_user.jpeg"}
            alt="Channel Logo"
            className="edit_channel_logo"
            onClick={() => document.getElementById("edit_channel_logoInput").click()}
          />
          <input
            type="file"
            id="edit_channel_logoInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={edit_channel_handleLogo}
          />
          <button
            type="button"
            className="edit_channel_logo-btn"
            onClick={() => document.getElementById("edit_channel_logoInput").click()}
          >
            Change Logo
          </button>
        </div>

        {/* Channel Name */}
        <h4>Channel Name</h4>
        <div className="edit_channel_field">
          <input
            type="text"
            value={edit_channel_data.channelName || ""}
            readOnly
          />
        </div>

        {/* Channel Description */}
        <h4>Description</h4>
        <div className="edit_channel_field">
          <textarea
            rows="4"
            value={edit_channel_data.channelDescription || ""}
            readOnly={!editableFields.channelDescription}
            onChange={(e) =>
              set_edit_channel_data({ ...edit_channel_data, channelDescription: e.target.value })
            }
          />
          <a onClick={() => edit_channel_enableField("channelDescription")}>EDIT</a>
        </div>

        {/* Channel Categories */}
        <h4>Categories</h4>
        <div className="edit_channel_categories">
          {allCategories.map((category) => (
            <label key={category} className="edit_channel_category-item">
              <input
                type="checkbox"
                checked={edit_channel_categories.includes(category)}
                onChange={() => edit_channel_handleCategoryToggle(category)}
              />
              {category}
            </label>
          ))}
        </div>

        {/* Terms */}
        <div className="edit_channel_terms">
          <label>
            <input type="checkbox" required /> I agree to the{" "}
            <span
              className="edit_channel_terms-link"
              onClick={() => set_edit_channel_termsVisible(true)}
            >
              Terms & Conditions
            </span>
          </label>
        </div>

        <button
          type="submit"
          className={`edit_channel_submit-btn ${saved ? "saved" : ""}`}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
        </button>

        {saved && (
          <p className="edit_channel_success-msg">Channel updated successfully!</p>
        )}
      </form>

      {/* Terms Overlay */}
      {edit_channel_termsVisible && (
        <div className="edit_channel_overlay">
          <div className="edit_channel_overlay-content" ref={overlayRef}>
            <button
              className="edit_channel_close-btn"
              onClick={() => set_edit_channel_termsVisible(false)}
            >
              X
            </button>
            <h1>Terms & Conditions</h1>
            <div className="edit_channel_overlay-text">
              <h2>1. Channel Guidelines</h2>
              <p>
                Maintain professionalism, avoid inappropriate content, and follow community rules.
              </p>

              <h2>2. Data Policy</h2>
              <p>
                Feeds collects minimal channel data to enhance discovery and engagement analytics.
              </p>

              <h2>3. Content Rights</h2>
              <p>
                You retain ownership of your uploads, but grant Feeds permission to display them publicly.
              </p>

              <h2>4. Termination</h2>
              <p>
                Violations of policy may lead to channel suspension or removal.
              </p>

              <p><strong>Last Updated: February 2025</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditChannel;
