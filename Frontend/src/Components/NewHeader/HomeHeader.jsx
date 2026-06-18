import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import './HomeHeader.css';

const HomeHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = localStorage.getItem('userEmail');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [hasPendingInvite, setHasPendingInvite] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const activeTab = queryParams.get('tab') || 'discover';

    useEffect(() => {
        if (!email) return;

        const fetchDuoStatus = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/duo/status?email=${email}`);
                const data = await response.json();
                if (response.ok) {
                    // Update profile photo
                    if (data.status === 'in_duo') {
                        const photo = data.me?.photos?.[0];
                        if (photo) {
                            setProfilePhoto(photo.startsWith("http") ? photo : `http://localhost:3000/uploads/${photo}`);
                        }
                    } else if (data.status === 'invite_received') {
                        setHasPendingInvite(true);
                    }
                }
            } catch (err) {
                console.error("HomeHeader status fetch error:", err);
            }
        };

        fetchDuoStatus();
        // Check periodically
        const timer = setInterval(fetchDuoStatus, 5000);
        return () => clearInterval(timer);
    }, [email]);

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        alert('Logging out...');
        navigate('/');
    };

    const defaultAvatar = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80";

    return (
        <nav className='home-nav'>
            <div className='home-nav-left-container'>
                <div className='home-nav-logo' onClick={() => navigate('/create-duo')} style={{ cursor: 'pointer' }}>
                    <span>Duo</span>
                    <span>Date</span>
                </div>
                {email && (
                    <div className='home-nav-tabs'>
                        <span
                            className={`home-nav-tab ${activeTab === 'discover' ? 'active' : ''}`}
                            onClick={() => navigate('/create-duo?tab=discover')}
                        >
                            Discover
                        </span>
                        <span
                            className={`home-nav-tab ${activeTab === 'interest' ? 'active' : ''}`}
                            onClick={() => navigate('/create-duo?tab=interest')}
                        >
                            Interest
                        </span>
                    </div>
                )}
            </div>

            <div className='home-nav-actions'>
                {/* Profile Photo Icon */}
                <div className='home-nav-profile' title="Profile Maker / Edit" onClick={() => navigate('/profile-maker')} style={{ cursor: 'pointer' }}>
                    <img
                        src={profilePhoto || defaultAvatar}
                        alt="Profile"
                        className="home-nav-avatar"
                    />
                </div>

                {/* Messages Icon */}
                <button
                    className='home-nav-icon-btn'
                    title="Duo Match Chat"
                    onClick={() => navigate('/create-duo')}
                >
                    <i className="ti ti-messages"></i>
                </button>

                {/* Requests Icon */}
                <button
                    className='home-nav-icon-btn'
                    title="Duo Requests"
                    onClick={() => navigate('/create-duo')}
                >
                    <i className="ti ti-user-plus"></i>
                    {hasPendingInvite && <span className="home-nav-badge">1</span>}
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
