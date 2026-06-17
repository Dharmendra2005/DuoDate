import "./HowItWork.css";

const HowItWork = () => {
  return (
    <section className="how page-section" id="how-it-work">
      <div className="how">
        <div className="section-label">
          <span className="section-tag">How It Works</span>
        </div>
        <h2 className="section-h">
          Four steps to your
          <br />
          perfect double date.
        </h2>
        <p className="section-sub">
          We handle the complexity. You handle the fun.
        </p>
        <div className="steps">
          <div className="step">
            <span className="step-num">01</span>
            <div className="step-icon v">
              <i
                className="ti ti-users"
                style={{ color: "#9B6FFF", fontSize: "20px" }}
              ></i>
            </div>
            <div className="step-title">Build your duo</div>
            <div className="step-desc">
              Invite a friend and create a joint profile. Share interests,
              photos, and a duo bio.
            </div>
          </div>
          <div className="step">
            <span className="step-num">02</span>
            <div className="step-icon c">
              <i
                className="ti ti-cards"
                style={{ color: "#FF8099", fontSize: "20px" }}
              ></i>
            </div>
            <div className="step-title">Swipe together</div>
            <div className="step-desc">
              Browse other duos. Both of you must swipe right for a match to be
              possible.
            </div>
          </div>
          <div className="step">
            <span className="step-num">03</span>
            <div className="step-icon m">
              <i
                className="ti ti-heart"
                style={{ color: "#00E5C3", fontSize: "20px" }}
              ></i>
            </div>
            <div className="step-title">Mutual match</div>
            <div className="step-desc">
              When both duos like each other, you get a 4-way match. Photos
              unlock instantly.
            </div>
          </div>
          <div className="step">
            <span className="step-num">04</span>
            <div className="step-icon g">
              <i
                className="ti ti-messages"
                style={{ color: "#FFD166", fontSize: "20px" }}
              ></i>
            </div>
            <div className="step-title">Plan the date</div>
            <div className="step-desc">
              A shared group chat opens. All four of you coordinate the perfect
              double date.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWork;
