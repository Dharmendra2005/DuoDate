import "./ChatView.css"


const ChatView = () => {
  return (
    <section className="chat-section">
      <div className="chat-text">
        <div className="section-label">
          <span className="section-tag">Group Chat</span>
        </div>
        <h2 className="section-h">
          One match,
          <br />
          one room.
        </h2>
        <p className="section-sub">
          The moment all four swipe right, a live group chat opens. Real-time,
          powered by Socket.io — plan your double date together.
        </p>
        <button
          className="btn-ghost"
          style={{ marginTop: "16px" }}
        >
          See the tech behind it ↗
        </button>
      </div>
      <div className="chat-window">
        <div className="chat-match-banner">
          <span className="match-fire">✨</span>
          <span className="match-banner-text">
            It's a double match! All 4 of you liked each other
          </span>
        </div>
        <div className="chat-header">
          <div className="chat-avatars">
            <div className="chat-av a">A</div>
            <div className="chat-av b">J</div>
            <div className="chat-av c">M</div>
            <div className="chat-av d">R</div>
          </div>
          <div className="chat-info">
            <div className="chat-group-name">
              Alex, Jamie, Morgan &amp; Riley
            </div>
            <div className="chat-members">4 members · matched just now</div>
          </div>
        </div>
        <div className="chat-body">
          <div className="msg them">
            <div className="msg-sender">Morgan</div>
            <div className="msg-bubble">omg hi!! finally a double match 🎉</div>
          </div>
          <div className="msg us">
            <div className="msg-bubble">
              We're so excited too! You both seem amazing 😍
            </div>
          </div>
          <div className="msg them">
            <div className="msg-sender">Riley</div>
            <div className="msg-bubble">
              Anyone up for coffee + board games Sunday?
            </div>
          </div>
          <div className="msg us">
            <div className="msg-bubble">Sunday is perfect — we're in! ☕🎲</div>
          </div>
        </div>
        <div className="chat-input-row">
          <input
            className="chat-input"
            placeholder="Message the group..."
            readonly=""
          />
          <button className="chat-send">
            <i className="ti ti-send" style={{ fontSize: "16px" }}></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatView;
