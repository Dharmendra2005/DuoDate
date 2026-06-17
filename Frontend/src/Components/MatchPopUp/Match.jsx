import { useState } from "react";
import "./Match.css";

const MatchPopUp = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className="match-popup show"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsVisible(false);
        }
      }}
    >
      <div className="match-modal">
        <div className="match-emoji">🎉</div>
        <h3>It's a Double Match!</h3>
        <p>All four of you liked each other. Your group chat is ready.</p>
        
        <div className="match-modal-duo">
          <div className="match-modal-av a">A</div>
          <div className="match-modal-av b">J</div>
          <div
            className="match-modal-av"
            style={{ display: "flex", alignItems: "center", fontSize: "22px", color: "#00E5C3" }}
          >
            ⟷
          </div>
          <div
            className="match-modal-av"
            style={{ background: "#00E5C322", borderColor: "#00E5C3", color: "#00E5C3" }}
          >
            M
          </div>
          <div
            className="match-modal-av"
            style={{ background: "#FFD16622", borderColor: "#FFD166", color: "#FFD166" }}
          >
            R
          </div>
        </div>
        
        <button
          className="match-close"
          onClick={() => setIsVisible(false)}
        >
          Open Group Chat 💬
        </button>
      </div>
    </div>
  );
};

export default MatchPopUp;
