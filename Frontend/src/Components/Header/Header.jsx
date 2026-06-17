import { useNavigate } from 'react-router';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();

    return (
        <nav className='nav'>
            <div className='nav-logo'>
                <span>Duo</span>
                <span>Date</span>
            </div>
            <div className='nav-links'>
                <a href="/" className="active">Home</a>
                <a href="#discover" >Discover</a>
                <a href="#how-it-work" >How it works</a>
                <a href="#safety" >Safety</a>
            </div>
            <div className="nav-acc">
                <p>Already have an account?</p>
                <button className="nav-cta" onClick={() => navigate('/signin')}>Sign IN →</button>
            </div>
        </nav>
    );
};

export default Header;