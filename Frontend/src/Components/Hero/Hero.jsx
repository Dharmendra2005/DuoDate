import { useNavigate } from 'react-router';
import './Hero.css'


const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <div className="hero-eyebrow">
        <span className="hero-eyebrow-dot"></span>
        The world's first group dating app
      </div>
      <h1 className="hero-title">
        Dating is
        <br />
        better {" "} 
        <span className="t-coral">together.</span>
        <br />
        <span className="t-violet">Always.</span>
      </h1>
      <p className="hero-subtitle">
        Bring your best friend. Swipe as a duo. Only match when both pairs say
        yes — no awkward solo adventures.
      </p>
      <div className="hero-actions">
        <button className="btn-primary" onClick={() => navigate('/signup')}>Start your duo →</button>
        <button id="how-it-works" className="btn-ghost">See how it works</button>
      </div>
      <div className="stats">
        <div className="stat">
            <div className="stat-num coral">2.4M+</div>
            <div className="stat-label">Active Duos</div>
        </div>
        <div className="stat">
            <div className="stat-num violet">840K</div>
            <div className="stat-label">DuO Dates</div>
        </div>
        <div className="stat">
            <div className="stat-num gold">98%</div>
            <div className="stat-label">Feel Safer</div>
        </div>
        <div className="stat">
            <div className="stat-num mint">3.2x</div>
            <div className="stat-label">More Fun</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
