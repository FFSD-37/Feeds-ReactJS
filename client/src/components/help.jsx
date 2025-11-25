import React from "react";
import "../styles/Help.css";

const faqs = [
  {
    q: "How do I reset my password?",
    a: "Click on Forgot Password on the login page and follow the instructions sent to your registered email.",
  },
  {
    q: "How can I contact support?",
    a: "Go to our Contact page and fill out the form or email support@feeds.com.",
  },
];

const Help = () => (
  <main className="help-card">
    <h1 className="help-title">Help & Support</h1>
    <section>
      <h2 className="help-subtitle">Frequently Asked Questions</h2>
      <ul>
        {faqs.map((item, idx) => (
          <li key={idx} className="help-faq-item">
            <b>{item.q}</b><br />
            <span>{item.a}</span>
          </li>
        ))}
      </ul>
    </section>
    <p className="help-footer">
      Still need help? <a className="help-link" href="/contact">Contact us</a>.
    </p>
  </main>
);

export default Help;