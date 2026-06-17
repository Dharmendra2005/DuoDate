import { useNavigate } from 'react-router';
import './HomeHeader.css';

const HomeHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        alert('Logging out...');
        navigate('/');
    };

    return (
        <nav className='home-nav'>
            <div className='home-nav-logo' onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <span>Duo</span>
                <span>Date</span>
            </div>
            
            <div className='home-nav-actions'>
                {/* Profile Photo Icon */}
                <div className='home-nav-profile' title="Profile" onClick={() => navigate('/profile-maker')}>
                    <img 
                        src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80" 
                        alt="Profile" 
                        className="home-nav-avatar"
                    />
                </div>

                {/* Messages Icon */}
                <button 
                    className='home-nav-icon-btn' 
                    title="Messages" 
                    onClick={() => alert("Opening messages chat...")}
                >
                    <i className="ti ti-messages"></i>
                    <span className="home-nav-badge">2</span>
                </button>

                {/* Requests Icon */}
                <button 
                    className='home-nav-icon-btn' 
                    title="Duo Requests" 
                    onClick={() => navigate('/create-duo')}
                >
                    <i className="ti ti-user-plus"></i>
                    <span className="home-nav-badge">1</span>
                </button>

                {/* Logout Button */}
                <button className="home-nav-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default HomeHeader;
