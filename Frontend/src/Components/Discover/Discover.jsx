import './Discover.css';



const Discover = () => {
  return (
    <section className="section" id="discover">
      <div className="section-label">
        <span className="span-tag">Duo Swipe</span>
      </div>
      <h2 className="section-h">
        Both pairs swipe.
        <br />
        One match unlocks.
      </h2>
      <p className="section-sub">
        Unlike traditional apps, a match only happens when both friends on both
        sides swipe right. Photos stay blurred until that moment.
      </p>
      <div className="swipe-arena">
        <div className="duo-stack">
          <div className="duo-label">
            Your duo <span className="duo-badge you">YOU + FRIEND</span>
          </div>
          <div className="profile-card">
            <div className="card-img-placeholder card-img-1">🧑‍🎨</div>
            <div className="card-body">
              <div className="card-name-row">
                <span className="card-name">Alex, 26</span>
                <span className="card-age">+ Jamie 25</span>
              </div>
              <div className="card-tags">
                <span className="tag v">Music</span>
                <span className="tag m">Hiking</span>
                <span className="tag g">Foodie</span>
              </div>
              <div className="card-dist">
                <i className="ti ti-map-pin"></i> ~3 km away
              </div>
            </div>
          </div>
          <div className="profile-card card-offset">
            <div className="card-img-placeholder card-img-2 blurred">
              😊<span className="blur-label">🔒 Match to reveal</span>
            </div>
            <div className="card-body">
              <div className="card-name-row">
                <span className="card-name">Sam, 24</span>
                <span className="card-age">+ Casey 27</span>
              </div>
              <div className="card-tags">
                <span className="tag c">Art</span>
                <span className="tag v">Travel</span>
              </div>
              <div className="card-dist">
                <i className="ti ti-map-pin"></i> &lt;5 km away
              </div>
            </div>
          </div>
        </div>

        <div className="match-zone">
          <div className="match-indicator">
            <div className="match-indicator-title">Compatibility</div>
            <div className="match-indicator-val" id="compat-val">
              73%
            </div>
            <div className="match-indicator-sub">Group score</div>
          </div>
          <div className="vs-divider">VS</div>
          <div className="swipe-btn-group">
            <button className="swipe-btn nope">
              <i className="ti ti-x"></i> Pass
            </button>
            <button className="swipe-btn like">
              ❤️ Both Like
            </button>
            <button className="swipe-btn super">
              ⭐ Super Like
            </button>
          </div>
        </div>

        <div className="duo-stack">
          <div className="duo-label">
            Their duo <span className="duo-badge them">THEM + FRIEND</span>
          </div>
          <div className="profile-card matched" id="their-card">
            <div className="card-img-placeholder card-img-3">👩‍💼</div>
            <div className="card-body">
              <div className="card-name-row">
                <span className="card-name">Morgan, 25</span>
                <span className="card-age">+ Riley 26</span>
              </div>
              <div className="card-tags">
                <span className="tag m">Coffee</span>
                <span className="tag v">Books</span>
                <span className="tag c">Yoga</span>
              </div>
              <div className="card-dist">
                <i className="ti ti-map-pin"></i> &lt;2 km away
              </div>
            </div>
          </div>
          <div className="profile-card card-offset" style={{ opacity: 0.5 }}>
            <div className="card-img-placeholder card-img-4 blurred">
              🙂<span className="blur-label">🔒 Match to reveal</span>
            </div>
            <div className="card-body">
              <div className="card-name-row">
                <span className="card-name">Jordan, 28</span>
                <span className="card-age">+ Drew 24</span>
              </div>
              <div className="card-tags">
                <span className="tag g">Gaming</span>
                <span className="tag m">Fitness</span>
              </div>
              <div className="card-dist">
                <i className="ti ti-map-pin"></i> &lt;8 km away
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default Discover;