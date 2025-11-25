import React from "react";
import "../styles/TandC.css";

const TandC = () => (
  <main className="tandc-card">
    <h1 className="tandc-title">Terms &amp; Conditions</h1>
    <ol className="tandc-list">
      <li>
        <b>Use of Service:</b><br />
        By registering, you agree to use Feeds responsibly and ethically.
      </li>
      <li>
        <b>Privacy:</b><br />
        Your data stays private with us and is used only according to our Privacy Policy.
      </li>
      <li>
        <b>Content Ownership:</b><br />
        You keep your rights, but we can display your content on Feeds.
      </li>
      <li>
        <b>Updates:</b><br />
        We may update terms at any time. Please review this page regularly.
      </li>
    </ol>
    <div className="tandc-footer">
      Questions? <a className="tandc-link" href="/contact">Contact support</a>.
    </div>
  </main>
);

export default TandC;