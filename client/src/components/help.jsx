import React from "react";
import "../styles/Help.css";

/*
ISSUES/Improvements:
1. Add more FAQs based on user feedback.
2. Implement a search feature for FAQs.
3. Include links to relevant help articles like forgot password.
*/

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
  /* Added the Container for the Blue Sky Background */
  <div className="help-container">
    
    {/* The Glass Card */}
    <main className="help-card">
      <h1 className="help-title">Help & Support</h1>
      
      <section>
        <h2 className="help-subtitle">Frequently Asked Questions</h2>
        <ul className="help-faq-list">
          {faqs.map((item, idx) => (
            <li key={idx} className="help-faq-item">
              <b>{item.q}</b>
              <span>{item.a}</span>
            </li>
          ))}
        </ul>
      </section>
      
      <p className="help-footer">
        Still need help? <a className="help-link" href="/contact">Contact us</a>
      </p>
    </main>
  </div>
);

export default Help;