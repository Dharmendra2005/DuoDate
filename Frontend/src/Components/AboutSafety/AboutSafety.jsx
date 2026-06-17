import "./AboutSafety.css";


const Safety = () => {
  return (
    <section id="safety" className="safety page-section">
      <div className="safety">
        <div className="section-label">
          <span className="section-tag">Privacy &amp; Safety</span>
        </div>
        <h2 className="section-h">
          Built safe
          <br />
          from day one.
        </h2>
        <p className="section-sub">
          Our backend privacy layer protects exact locations and personal data
          until a real mutual match occurs.
        </p>
        <div className="safety-grid">
          <div className="safety-card">
            <div className="safety-icon">
              <i
                className="ti ti-map-off"
                style={{ color: "#00E5C3", fontSize: "28px" }}
              ></i>
            </div>
            <div className="safety-title">Geo-fencing privacy</div>
            <div className="safety-desc">
              Exact GPS is never exposed. Our backend returns distance buckets
              only ("under 2 km"), preventing any location tracking or stalking.
            </div>
          </div>
          <div className="safety-card">
            <div className="safety-icon">
              <i
                className="ti ti-photo-off"
                style={{ color: "#7B2FFF", fontSize: "28px" }}
              ></i>
            </div>
            <div className="safety-title">Blurred until matched</div>
            <div className="safety-desc">
              Profile photos use progressive blur on the client side — full-res
              images are gated behind server-side match confirmation, never
              pre-loaded.
            </div>
          </div>
          <div className="safety-card">
            <div className="safety-icon">
              <i
                className="ti ti-shield-check"
                style={{ color: "#FFD166", fontSize: "28px" }}
              ></i>
            </div>
            <div className="safety-title">Buddy system built in</div>
            <div className="safety-desc">
              You always go with a friend. The group dynamic deters bad actors
              and ensures you never meet strangers alone.
            </div>
          </div>
          <div className="safety-card">
            <div className="safety-icon">
              <i
                className="ti ti-lock"
                style={{ color: "#FF4D6D", fontSize: "28px" }}
              ></i>
            </div>
            <div className="safety-title">End-to-end chat</div>
            <div className="safety-desc">
              Group chat messages are encrypted in transit via Socket.io with
              JWT-authenticated rooms — only matched users can join a chat room.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Safety;
