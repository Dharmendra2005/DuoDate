import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import './HomeHeader.css';

const HomeHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = localStorage.getItem('userEmail');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [hasPendingInvite, setHasPendingInvite] = useState(false);
    const [incomingInvite, setIncomingInvite] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [pendingGroupRequestsCount, setPendingGroupRequestsCount] = useState(0);

    const queryParams = new URLSearchParams(location.search);
    const activeTab = queryParams.get('tab') || 'discover';

    useEffect(() => {
        if (!email) return;

        const fetchData = async () => {
            // 1. Fetch duo status (invites, partner info, photo)
            try {
                const response = await fetch(`http://localhost:3000/api/duo/status?email=${email}`);
                const data = await response.json();
                if (response.ok) {
                    // Update profile photo
                    const photo = data.me?.photos?.[0];
                    if (photo) {
                        setProfilePhoto(photo.startsWith("http") ? photo : `http://localhost:3000/uploads/${photo}`);
                    } else {
                        setProfilePhoto('');
                    }

                    if (data.status === 'in_duo') {
                        setHasPendingInvite(false);
                        setIncomingInvite(null);
                    } else if (data.status === 'invite_received') {
                        setHasPendingInvite(true);
                        setIncomingInvite(data.invite);
                    } else {
                        setHasPendingInvite(false);
                        setIncomingInvite(null);
                    }
                }
            } catch (err) {
                console.error("HomeHeader status fetch error:", err);
            }

            // 2. Fetch matches to count pending group chat requests
            try {
                const response = await fetch(`http://localhost:3000/api/duo/matches?email=${email}`);
                const data = await response.json();
                if (response.ok) {
                    const matchesList = data.matches || [];
                    // Count matches where chatStatus is 'pending' and user has not accepted yet
                    const count = matchesList.filter(m => 
                        m.chatStatus === 'pending' && !m.acceptances?.includes(email)
                    ).length;
                    setPendingGroupRequestsCount(count);
                }
            } catch (err) {
                console.error("HomeHeader matches fetch error:", err);
            }
        };

        fetchData();
        // Check periodically
        const timer = setInterval(fetchData, 5000);
        return () => clearInterval(timer);
    }, [email]);

    const handleAcceptInvite = async (senderEmail) => {
        if (!email || !senderEmail) return;
        try {
            const response = await fetch('http://localhost:3000/api/duo/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderEmail: senderEmail,
                    receiverEmail: email
                })
            });
            if (response.ok) {
                setIncomingInvite(null);
                setHasPendingInvite(false);
                setIsDropdownOpen(false);
                navigate('/create-duo?tab=discover');
            }
        } catch (err) {
            console.error("Header accept error:", err);
        }
    };

    const handleRejectInvite = async (senderEmail) => {
        if (!email || !senderEmail) return;
        try {
            const response = await fetch('http://localhost:3000/api/duo/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderEmail: senderEmail,
                    receiverEmail: email
                })
            });
            if (response.ok) {
                setIncomingInvite(null);
                setHasPendingInvite(false);
                setIsDropdownOpen(false);
            }
        } catch (err) {
            console.error("Header reject error:", err);
        }
    };

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
                    onClick={() => navigate('/create-duo?tab=chat')}
                >
                    <i className="ti ti-messages"></i>
                    {pendingGroupRequestsCount > 0 && (
                        <span className="home-nav-badge">{pendingGroupRequestsCount}</span>
                    )}
                </button>

                {/* Requests Button with Dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        className='home-nav-icon-btn'
                        title="Duo Requests"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <i className="ti ti-user-plus"></i>
                        {hasPendingInvite && <span className="home-nav-badge">1</span>}
                    </button>

                    {isDropdownOpen && (
                        <div className="home-nav-requests-dropdown" style={{
                            position: 'absolute',
                            top: '46px',
                            right: '0',
                            width: '280px',
                            background: '#151628',
                            border: '1px solid #2A2B40',
                            borderRadius: '8px',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                            padding: '12px',
                            zIndex: 1000,
                            fontFamily: 'sans-serif'
                        }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#7B7D9A', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Duo Requests</h4>
                            {incomingInvite ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#7b2fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                            {incomingInvite.sender?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{incomingInvite.sender?.name}</span>
                                            <span style={{ fontSize: '10px', color: '#888' }}>wants to pair</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button 
                                            type="button" 
                                            onClick={() => handleAcceptInvite(incomingInvite.sender.email)}
                                            style={{ background: '#10b981', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block', width: 'auto', minHeight: 'auto' }}
                                        >
                                            Acc
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRejectInvite(incomingInvite.sender.email)}
                                            style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block', width: 'auto', minHeight: 'auto' }}
                                        >
                                            Rej
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '8px', textAlign: 'center', color: '#888', fontSize: '11px' }}>
                                    No pending requests
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <button className="home-nav-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default HomeHeader;
