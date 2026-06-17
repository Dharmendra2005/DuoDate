import "./Footer.css";

const Footer = () => {
  return (
    <div>
      <div className="footer-cta">
        <div className="footer-cta-accent"></div>
        <div className="footer-cta-accent2"></div>
        <h2>
          Ready to find your
          <br />
          <span style={{ color: "#FF4D6D" }}>double</span>{" "}
          <span style={{ color: "#7B2FFF" }}>match?</span>
        </h2>
        <p>Bring your best friend and start swiping together.</p>
        <button
          className="btn-primary"
          style={{ fontSize: "16px", padding: "16px 40px" }}
          onClick={() => document.getElementById('match-popup').classList.add('show')}
        >
          Create your duo — it's free
        </button>
      </div>
      <div className="footer-bar">
        <div className="footer-logo">
          <span style={{ color: "#FF4D6D" }}>Duo</span>
          <span style={{ color: "#7B2FFF" }}>Date</span>
        </div>
        <div className="footer-note">
          © 2025 DuoDate · Privacy · Terms · Safety
        </div>
      </div>
    </div>
  );
};

export default Footer;
