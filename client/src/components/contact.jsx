import React, { useState } from "react";
import "../styles/Contact.css";

const Contact = () => {
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setFields({ ...fields, [e.target.name]: e.target.value });

  const handleBlur = (e) =>
    setTouched({ ...touched, [e.target.name]: true });

  const isValid =
    fields.name.trim() &&
    /\S+@\S+\.\S+/.test(fields.email) &&
    fields.message.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) setSubmitted(true);
  };

  return (
    // This container holds the Night Sky Background
    <div className="contact-container">
      
      {/* This card is the Glass Effect Bubble */}
      <div className="contact-card">
        <h1 className="contact-title">Contact Us</h1>
        
        {submitted ? (
          <div className="contact-success">
            <h3>Message Sent! 🚀</h3>
            <p>We’ll get back to you soon.</p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <label>
              Name
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={fields.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={touched.name && !fields.name ? "contact-error" : ""}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={fields.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={
                  touched.email &&
                  (!fields.email || !/\S+@\S+\.\S+/.test(fields.email))
                    ? "contact-error"
                    : ""
                }
              />
            </label>

            <label>
              Message
              <textarea
                name="message"
                placeholder="Type your message..."
                value={fields.message}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                rows={4}
                className={
                  touched.message && !fields.message ? "contact-error" : ""
                }
              />
            </label>

            <button
              className="contact-btn"
              type="submit"
              disabled={!isValid}
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;