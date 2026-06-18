import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import HomeHeader from '../NewHeader/HomeHeader';
import './CreateDuo.css';

const CreateDuo = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'discover';

  const [step, setStep] = useState(1);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteSent, setIsInviteSent] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [isMatched, setIsMatched] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [interestSubTab, setInterestSubTab] = useState('incoming'); // 'incoming' or 'my_likes'

  // Backend tracking states
  const email = localStorage.getItem('userEmail');
  const [duoStatus, setDuoStatus] = useState('solo');
  const [interestsData, setInterestsData] = useState({ incoming_likes: [], my_likes: [] });
  const [loading, setLoading] = useState(true);

  // Dynamic profiles
  const [myProfile, setMyProfile] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);

  // Discover deck states
  const [discoverDuos, setDiscoverDuos] = useState([]);
  const [currentDuoIndex, setCurrentDuoIndex] = useState(0);

  // Matched duo states
  const [matchedDuoData, setMatchedDuoData] = useState(null);
  const [matchedId, setMatchedId] = useState(null);

  // Chat messaging states
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');

  // User search and invite states
  const [searchResults, setSearchResults] = useState([]);
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [sentInvite, setSentInvite] = useState(null);

  // Gallery navigation states for the Step 2 dashboard view
  const [myPhotoIndex, setMyPhotoIndex] = useState(0);
  const [friendPhotoIndex, setFriendPhotoIndex] = useState(0);
  const [oppPhotoIndex0, setOppPhotoIndex0] = useState(0);
  const [oppPhotoIndex1, setOppPhotoIndex1] = useState(0);

  const getPhotoUrl = (photo) => {
    if (!photo) return "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80";
    if (photo.startsWith("http")) return photo;
    return `http://localhost:3000/uploads/${photo}`;
  };

  const checkDuoStatus = async () => {
    if (!email) return;
    try {
      const statusRes = await fetch(`http://localhost:3000/api/duo/status?email=${email}`);
      const statusData = await statusRes.json();
      if (statusRes.ok) {
        setDuoStatus(statusData.status);
        if (statusData.status === 'in_duo') {
          setStep(2);
          setIsInviteModalOpen(false);
          setMyProfile(statusData.me);
          setPartnerProfile(statusData.partner);

          // Fetch discoverable duos if not loaded
          if (discoverDuos.length === 0) {
            const discoverRes = await fetch(`http://localhost:3000/api/duo/discover?email=${email}`);
            const discoverData = await discoverRes.json();
            if (discoverRes.ok) {
              setDiscoverDuos(discoverData.duos || []);
            }
          }
        } else if (statusData.status === 'invite_received') {
          setStep(1);
          setIncomingInvite(statusData.invite);
        } else if (statusData.status === 'invite_sent') {
          setStep(1);
          setSentInvite(statusData.invite);
        } else {
          setStep(1);
          setIncomingInvite(null);
          setSentInvite(null);
        }
      }
    } catch (err) {
      console.error("Error checking duo status:", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const initLoad = async () => {
      try {
        await checkDuoStatus();
        
        // Load interest board data
        const interestsRes = await fetch(`http://localhost:3000/api/duo/interests?email=${email}`);
        const intData = await interestsRes.json();
        if (interestsRes.ok) {
          setInterestsData(intData);
        }
      } catch (err) {
        console.error("Init load error:", err);
      } finally {
        setLoading(false);
      }
    };

    initLoad();
  }, [email, activeTab]);

  // Duo status polling effect
  useEffect(() => {
    let interval;
    if (email && duoStatus !== 'in_duo') {
      interval = setInterval(() => {
        checkDuoStatus();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [email, duoStatus]);

  // Reset photo indices when opposing duo deck moves to a new index
  useEffect(() => {
    setOppPhotoIndex0(0);
    setOppPhotoIndex1(0);
  }, [currentDuoIndex]);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/users/search?q=${searchQuery}&email=${email}`);
        const data = await response.json();
        if (response.ok) {
          setSearchResults(data.users || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, email]);

  // Message polling effect
  useEffect(() => {
    let interval;
    if (isMatched && matchedId) {
      fetchMessages(matchedId);
      interval = setInterval(() => {
        fetchMessages(matchedId);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMatched, matchedId]);

  const fetchMessages = async (mId) => {
    if (!mId) return;
    try {
      const response = await fetch(`http://localhost:3000/api/duo/messages?matchId=${mId}`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() || !matchedId || !email) return;

    try {
      const response = await fetch('http://localhost:3000/api/duo/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: matchedId,
          senderEmail: email,
          text: newMessageText
        })
      });
      if (response.ok) {
        setNewMessageText('');
        fetchMessages(matchedId);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText("duodate.app/invite/dharm-x7k2p");
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

  const handleNextPhoto = (target) => {
    if (target === 'me') {
      const photosLength = myProfile?.photos?.length || 0;
      if (photosLength > 0) {
        setMyPhotoIndex((prev) => (prev + 1) % photosLength);
      }
    } else {
      const photosLength = partnerProfile?.photos?.length || 0;
      if (photosLength > 0) {
        setFriendPhotoIndex((prev) => (prev + 1) % photosLength);
      }
    }
  };

  const handlePrevPhoto = (target) => {
    if (target === 'me') {
      const photosLength = myProfile?.photos?.length || 0;
      if (photosLength > 0) {
        setMyPhotoIndex((prev) => (prev - 1 + photosLength) % photosLength);
      }
    } else {
      const photosLength = partnerProfile?.photos?.length || 0;
      if (photosLength > 0) {
        setFriendPhotoIndex((prev) => (prev - 1 + photosLength) % photosLength);
      }
    }
  };

  const handleOppPrevPhoto = (memberIdx, photosLength) => {
    if (photosLength <= 1) return;
    if (memberIdx === 0) {
      setOppPhotoIndex0((prev) => (prev - 1 + photosLength) % photosLength);
    } else {
      setOppPhotoIndex1((prev) => (prev - 1 + photosLength) % photosLength);
    }
  };

  const handleOppNextPhoto = (memberIdx, photosLength) => {
    if (photosLength <= 1) return;
    if (memberIdx === 0) {
      setOppPhotoIndex0((prev) => (prev + 1) % photosLength);
    } else {
      setOppPhotoIndex1((prev) => (prev + 1) % photosLength);
    }
  };

  const handleSendInvite = async (receiverEmail) => {
    if (email && receiverEmail) {
      try {
        const response = await fetch('http://localhost:3000/api/duo/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderEmail: email,
            receiverEmail: receiverEmail
          })
        });
        const data = await response.json();
        if (response.ok) {
          setSearchQuery('');
          setSearchResults([]);
          await checkDuoStatus();
        } else {
          alert(data.message || "Failed to send invitation.");
        }
      } catch (err) {
        console.error("Invite send error:", err);
      }
    }
  };

  const handleAcceptInvite = async (senderEmail) => {
    if (email && senderEmail) {
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
          setIsInviteModalOpen(false);
          setIncomingInvite(null);
          setAnimationClass('slide-out');
          setTimeout(async () => {
            setDuoStatus('in_duo');
            setStep(2);
            setAnimationClass('slide-in');
            await checkDuoStatus();
            setTimeout(() => {
              setAnimationClass('');
            }, 500);
          }, 500);
        }
      } catch (err) {
        console.error("Duo accept error:", err);
      }
    }
  };

  const handleRejectInvite = async (senderEmail) => {
    if (email && senderEmail) {
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
          setDuoStatus('solo');
        }
      } catch (err) {
        console.error("Duo reject error:", err);
      }
    }
  };

  const handleCancelInvite = async (receiverEmail) => {
    if (email && receiverEmail) {
      try {
        const response = await fetch('http://localhost:3000/api/duo/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderEmail: email,
            receiverEmail: receiverEmail
          })
        });
        if (response.ok) {
          setSentInvite(null);
          setDuoStatus('solo');
        }
      } catch (err) {
        console.error("Cancel invite error:", err);
      }
    }
  };

  const handleSwipe = async (action) => {
    if (discoverDuos.length === 0 || currentDuoIndex >= discoverDuos.length) return;
    const currentDuo = discoverDuos[currentDuoIndex];

    if (email) {
      try {
        const response = await fetch('http://localhost:3000/api/duo/swipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            swiperEmail: email,
            targetDuoId: currentDuo.id,
            action: action
          })
        });
        const data = await response.json();
        if (response.ok) {
          if (data.matched) {
            setMatchedDuoData(currentDuo);
            setMatchedId(data.matchId);
            setIsMatched(true);
          } else {
            setCurrentDuoIndex((prev) => prev + 1);
          }
        }
      } catch (err) {
        console.error("Error swiping:", err);
      }
    }
  };

  const handleMatchBack = async (targetDuoId) => {
    if (email) {
      try {
        const response = await fetch('http://localhost:3000/api/duo/swipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            swiperEmail: email,
            targetDuoId: targetDuoId,
            action: 'like'
          })
        });
        const data = await response.json();
        if (response.ok) {
          const matchedDuo = (interestsData.incoming_likes || []).find(d => d.id === targetDuoId) || discoverDuos.find(d => d.id === targetDuoId);
          setMatchedDuoData(matchedDuo);
          setMatchedId(data.matchId);
          setIsMatched(true);
        }
      } catch (err) {
        console.error("Match back error:", err);
      }
    }
  };

  const handleLeaveDuo = async () => {
    if (email) {
      try {
        const response = await fetch('http://localhost:3000/api/duo/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        if (response.ok) {
          setDuoStatus('solo');
          setStep(1);
        }
      } catch (err) {
        console.error("Error leaving duo:", err);
      }
    }
  };

  const defaultAvatar = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80";
  const incomingLikes = interestsData.incoming_likes || [];
  const myLikes = interestsData.my_likes || [];

  return (
    <div className="create-duo-page">
      <HomeHeader />

      {activeTab === 'interest' ? (
        /* ================= INTEREST BOARD VIEW ================= */
        <div className={`interests-page-wrapper ${animationClass}`}>
          <div className="interests-container">
            <div className="interests-header">
              <h1 className="interests-title">Interests Board</h1>
              <p className="interests-subtitle">
                See who is interested in your duo and review the duos you liked.
              </p>
              
              <div className="interests-subtabs">
                <button
                  type="button"
                  className={`interests-subtab ${interestSubTab === 'incoming' ? 'active' : ''}`}
                  onClick={() => setInterestSubTab('incoming')}
                >
                  Who Likes Us ({incomingLikes.length})
                </button>
                <button
                  type="button"
                  className={`interests-subtab ${interestSubTab === 'my_likes' ? 'active' : ''}`}
                  onClick={() => setInterestSubTab('my_likes')}
                >
                  Our Likes ({myLikes.length})
                </button>
              </div>
            </div>

            <div className="interests-content">
              {interestSubTab === 'incoming' ? (
                <div className="interests-grid">
                  {incomingLikes.length === 0 ? (
                    <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: '#aaa' }}>
                      No incoming likes yet. Keep swiping!
                    </div>
                  ) : (
                    incomingLikes.map((duo) => (
                      <div key={duo.id} className="interest-card">
                        <div className="interest-card-header">
                          <div className="compatibility-badge">
                            ⭐ {duo.compatibility}% Match
                          </div>
                        </div>
                        
                        <div className="interest-card-images">
                          <div className="duo-avatar-pair">
                            {duo.members.map((m, idx) => (
                              <div key={idx} className="avatar-frame">
                                <img src={getPhotoUrl(m.photos?.[0])} alt={m.name} className="avatar-img" />
                                <div className="avatar-overlay">
                                  <span className="avatar-name">{m.name}, {m.age}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="interest-card-body">
                          <div className="interest-bios">
                            {duo.members.map((m, idx) => (
                              <p key={idx} className="bio-line">
                                <strong>{m.name}:</strong> {m.bio || "No bio description entered."}
                              </p>
                            ))}
                          </div>
                          
                          <div className="interest-card-actions">
                            <button 
                              type="button" 
                              className="btn-primary match-action-btn"
                              onClick={() => handleMatchBack(duo.id)}
                            >
                              ❤️ Match with them!
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="interests-grid">
                  {myLikes.length === 0 ? (
                    <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: '#aaa' }}>
                      You haven't liked any duos yet. Go to Discover to find matches!
                    </div>
                  ) : (
                    myLikes.map((duo) => (
                      <div key={duo.id} className="interest-card">
                        <div className="interest-card-header">
                          <div className="compatibility-badge">
                            ⭐ {duo.compatibility}% Match
                          </div>
                        </div>
                        
                        <div className="interest-card-images">
                          <div className="duo-avatar-pair">
                            {duo.members.map((m, idx) => (
                              <div key={idx} className="avatar-frame">
                                <img src={getPhotoUrl(m.photos?.[0])} alt={m.name} className="avatar-img" />
                                <div className="avatar-overlay">
                                  <span className="avatar-name">{m.name}, {m.age}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="interest-card-body">
                          <div className="interest-bios">
                            {duo.members.map((m, idx) => (
                              <p key={idx} className="bio-line">
                                <strong>{m.name}:</strong> {m.bio || "No bio description entered."}
                              </p>
                            ))}
                          </div>
                          <div className="interest-status-label">
                            <span>Pending response...</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= DISCOVER OR MAIN SWIPE FLOW ================= */
        <>
          {/* STEP 1: LANDING & INVITE POPUP */}
          {step === 1 && (
            <div className={`onboarding-page-wrapper ${animationClass}`}>
              <div className="discover-landing-card shadow-lg">
                <h2 className="landing-title">Find your match. Together.</h2>
                <p className="landing-text">
                  To enter the Swipe Arena, you need to create a Duo profile with a friend. 
                  Invite a friend now or wait for their approval.
                </p>
                <button 
                  type="button" 
                  className="btn-primary landing-cta"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  Open Invite Panel & Connect
                </button>
              </div>

              {/* INVITE POPUP MODAL */}
              {isInviteModalOpen && (
                <div className="invite-modal-overlay" onClick={() => setIsInviteModalOpen(false)}>
                  <div className="onboarding-card invite-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="step-indicator">
                      <div className="step-track">
                        <div className="step-progress" style={{ width: '0%' }}></div>
                      </div>
                      <div className="step-nodes">
                        <span className="step-node active">1</span>
                        <span className="step-node">2</span>
                      </div>
                    </div>

                    <div className="step-view">
                      <div className="step-header">
                        <h1 className="step-title">Invite your duo partner</h1>
                        <p className="step-description">
                          Find a friend already on DuoDate, or share your unique link. Once they confirm, your combined profile deck goes active.
                        </p>
                      </div>

                      <div className="form-group">
                        <label htmlFor="searchInput" className="form-label">Search by username or phone</label>
                        <div className="input-wrapper">
                          <span className="input-prefix">@</span>
                          <input
                            id="searchInput"
                            type="text"
                            className="form-input"
                            placeholder="username or +91..."
                            value={searchQuery}
                            onChange={handleSearch}
                          />
                        </div>
                      </div>

                      {/* Search Results Dropdown */}
                      {searchResults.length > 0 && (
                        <div className="search-results-list" style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          marginTop: '-8px',
                          marginBottom: '16px',
                          maxHeight: '180px',
                          overflowY: 'auto',
                          padding: '4px'
                        }}>
                          {searchResults.map((user) => (
                            <div key={user.email} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img 
                                  src={getPhotoUrl(user.photo)} 
                                  alt={user.name} 
                                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>{user.name}</span>
                                  <span style={{ fontSize: '11px', color: '#888' }}>{user.email}</span>
                                </div>
                              </div>
                              <button 
                                type="button" 
                                className="btn-primary"
                                style={{ padding: '4px 10px', fontSize: '12px', minHeight: 'auto', width: 'auto' }}
                                onClick={() => handleSendInvite(user.email)}
                              >
                                Invite
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="divider-row">
                        <span className="divider-text">or share your link</span>
                      </div>

                      <div className="link-share-box">
                        <span className="link-url">duodate.app/invite/dharm-x7k2p</span>
                        <button type="button" className="btn-secondary btn-sm" onClick={copyInviteLink}>
                          {copyStatus}
                        </button>
                      </div>

                      {/* Pending Sent Invite Box */}
                      {sentInvite && (
                        <div className="status-alert-box alert-pending" style={{ marginTop: '20px' }}>
                          <div className="alert-header">
                            <span className="pulse-indicator"></span>
                            <span className="alert-title">Request Pending</span>
                          </div>
                          <p className="alert-body">
                            Waiting for <strong>{sentInvite.receiver.name}</strong> ({sentInvite.receiver.email}) to accept your invite request and enter the lobby...
                          </p>
                          <button 
                            type="button" 
                            className="btn-secondary w-100" 
                            style={{ marginTop: '12px', padding: '8px' }}
                            onClick={() => handleCancelInvite(sentInvite.receiver.email)}
                          >
                            Cancel Invitation
                          </button>
                        </div>
                      )}

                      {/* Incoming Received Invite Box */}
                      {incomingInvite && (
                        <div className="status-alert-box alert-pending" style={{ marginTop: '20px' }}>
                          <div className="alert-header">
                            <span className="pulse-indicator"></span>
                            <span className="alert-title">Duo Invite Received</span>
                          </div>
                          <p className="alert-body">
                            <strong>{incomingInvite.sender.name}</strong> ({incomingInvite.sender.email}) has invited you to be their duo partner!
                          </p>
                          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button 
                              type="button" 
                              className="btn-primary" 
                              style={{ flex: 1, padding: '8px' }}
                              onClick={() => handleAcceptInvite(incomingInvite.sender.email)}
                            >
                              Accept
                            </button>
                            <button 
                              type="button" 
                              className="btn-secondary" 
                              style={{ flex: 1, padding: '8px' }}
                              onClick={() => handleRejectInvite(incomingInvite.sender.email)}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="step-footer">
                        <button type="button" className="btn-ghost" onClick={() => setIsInviteModalOpen(false)}>← Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DUO SWIPE ARENA (Full Page Dashboard) */}
          {step === 2 && (
            <div className={`swipe-page-wrapper ${animationClass}`}>
              {!isMatched ? (
                <div className="swipe-main-container">
                  <div className="swipe-page-header">
                    <h1 className="swipe-title">Duo Swipe Arena</h1>
                    <p className="swipe-subtitle">
                      Both you and your partner swipe together. One match unlocks the conversation.
                    </p>
                  </div>

                  {(!discoverDuos || discoverDuos.length === 0 || currentDuoIndex >= discoverDuos.length) ? (
                    <div className="radar-scanner-container">
                      <div className="radar-glow"></div>
                      <div className="radar-circle">
                        <img 
                          src={myProfile?.photos?.[0] ? getPhotoUrl(myProfile.photos[0]) : defaultAvatar} 
                          alt="Searching..." 
                          className="radar-avatar" 
                        />
                      </div>
                      <h2 className="radar-title">Searching for duos...</h2>
                      <p className="radar-text">
                        Looking for new profiles in your area. Hang tight, matching is in progress!
                      </p>
                    </div>
                  ) : (
                    <div className="swipe-arena full-width-arena">
                      {/* YOUR DUO */}
                      <div className="duo-stack">
                        <div className="duo-label">
                          Your duo <span className="duo-badge you">YOU + FRIEND</span>
                        </div>
                        {/* Member 1: Partner (Gareena / Back) */}
                        <div className="profile-card">
                          <div className="card-img-placeholder" style={{ cursor: 'pointer' }} onClick={() => handleNextPhoto('friend')}>
                            {partnerProfile?.photos?.length > 0 ? (
                              <img src={getPhotoUrl(partnerProfile.photos[friendPhotoIndex])} alt={partnerProfile.name} className="card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              "😊"
                            )}
                            {(partnerProfile?.photos?.length || 0) > 1 && (
                              <>
                                <button
                                  type="button"
                                  className="card-arrow-btn prev"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevPhoto('friend');
                                  }}
                                >
                                  &lt;
                                </button>
                                <button
                                  type="button"
                                  className="card-arrow-btn next"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNextPhoto('friend');
                                  }}
                                >
                                  &gt;
                                </button>
                              </>
                            )}
                          </div>
                          <div className="card-body">
                            <div className="card-name-row">
                              <span className="card-name">{partnerProfile?.name || "Partner"}, {partnerProfile?.age || 22}</span>
                            </div>
                            <p className="card-bio" style={{ fontSize: '13px', color: '#888', marginTop: '4px', minHeight: '32px' }}>
                              {partnerProfile?.bio || "No bio description entered."}
                            </p>
                          </div>
                        </div>
                        {/* Member 2: Self (Alexa / Front Offset) */}
                        <div className="profile-card card-offset">
                          <div className="card-img-placeholder" style={{ cursor: 'pointer' }} onClick={() => handleNextPhoto('me')}>
                            {myProfile?.photos?.length > 0 ? (
                              <img src={getPhotoUrl(myProfile.photos[myPhotoIndex])} alt={myProfile.name} className="card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              "🧑‍🎨"
                            )}
                            {(myProfile?.photos?.length || 0) > 1 && (
                              <>
                                <button
                                  type="button"
                                  className="card-arrow-btn prev"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevPhoto('me');
                                  }}
                                >
                                  &lt;
                                </button>
                                <button
                                  type="button"
                                  className="card-arrow-btn next"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNextPhoto('me');
                                  }}
                                >
                                  &gt;
                                </button>
                              </>
                            )}
                          </div>
                          <div className="card-body">
                            <div className="card-name-row">
                              <span className="card-name">{myProfile?.name || "You"}, {myProfile?.age || 22}</span>
                            </div>
                            <p className="card-bio" style={{ fontSize: '13px', color: '#888', marginTop: '4px', minHeight: '32px' }}>
                              {myProfile?.bio || "No bio description entered."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* COMPATIBILITY MATCH ZONE */}
                      <div className="match-zone">
                        <div className="match-indicator">
                          <div className="match-indicator-title">Compatibility</div>
                          <div className="match-indicator-val">{discoverDuos[currentDuoIndex]?.compatibility || 78}%</div>
                          <div className="match-indicator-sub">Group score</div>
                        </div>
                        <div className="vs-divider">VS</div>
                        <div className="swipe-btn-group">
                          <button type="button" className="swipe-btn nope" onClick={() => handleSwipe('pass')}>
                            Pass
                          </button>
                          <button type="button" className="swipe-btn like" onClick={() => handleSwipe('like')}>
                            ❤️ Both Like
                          </button>
                          <button type="button" className="swipe-btn super" onClick={() => handleSwipe('like')}>
                            ⭐ Super Like
                          </button>
                        </div>
                      </div>

                      {/* THEIR DUO */}
                      <div className="duo-stack">
                        <div className="duo-label">
                          Their duo <span className="duo-badge them">THEM + FRIEND</span>
                        </div>
                        {/* Member 1: Fully Visible */}
                        <div className="profile-card matched">
                          <div className="card-img-placeholder" style={{ cursor: 'pointer' }} onClick={() => handleOppNextPhoto(0, discoverDuos[currentDuoIndex]?.members?.[0]?.photos?.length || 0)}>
                            {discoverDuos[currentDuoIndex]?.members?.[0]?.photos?.length > 0 ? (
                              <img src={getPhotoUrl(discoverDuos[currentDuoIndex].members[0].photos[oppPhotoIndex0])} alt={discoverDuos[currentDuoIndex].members[0].name} className="card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              "👩‍💼"
                            )}
                            {(discoverDuos[currentDuoIndex]?.members?.[0]?.photos?.length || 0) > 1 && (
                              <>
                                <button
                                  type="button"
                                  className="card-arrow-btn prev"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOppPrevPhoto(0, discoverDuos[currentDuoIndex].members[0].photos.length);
                                  }}
                                >
                                  &lt;
                                </button>
                                <button
                                  type="button"
                                  className="card-arrow-btn next"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOppNextPhoto(0, discoverDuos[currentDuoIndex].members[0].photos.length);
                                  }}
                                >
                                  &gt;
                                </button>
                              </>
                            )}
                          </div>
                          <div className="card-body">
                            <div className="card-name-row">
                              <span className="card-name">
                                {discoverDuos[currentDuoIndex]?.members?.[0]?.name || "User"}, {discoverDuos[currentDuoIndex]?.members?.[0]?.age || 22}
                              </span>
                            </div>
                            <p className="card-bio" style={{ fontSize: '13px', color: '#888', marginTop: '4px', minHeight: '32px' }}>
                              {discoverDuos[currentDuoIndex]?.members?.[0]?.bio || "No bio description entered."}
                            </p>
                          </div>
                        </div>
                        {/* Member 2: Fully Visible */}
                        <div className="profile-card card-offset">
                          <div className="card-img-placeholder" style={{ cursor: 'pointer' }} onClick={() => handleOppNextPhoto(1, discoverDuos[currentDuoIndex]?.members?.[1]?.photos?.length || 0)}>
                            {discoverDuos[currentDuoIndex]?.members?.[1]?.photos?.length > 0 ? (
                              <img src={getPhotoUrl(discoverDuos[currentDuoIndex].members[1].photos[oppPhotoIndex1])} alt={discoverDuos[currentDuoIndex].members[1].name} className="card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              "🙂"
                            )}
                            {(discoverDuos[currentDuoIndex]?.members?.[1]?.photos?.length || 0) > 1 && (
                              <>
                                <button
                                  type="button"
                                  className="card-arrow-btn prev"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOppPrevPhoto(1, discoverDuos[currentDuoIndex].members[1].photos.length);
                                  }}
                                >
                                  &lt;
                                </button>
                                <button
                                  type="button"
                                  className="card-arrow-btn next"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOppNextPhoto(1, discoverDuos[currentDuoIndex].members[1].photos.length);
                                  }}
                                >
                                  &gt;
                                </button>
                              </>
                            )}
                          </div>
                          <div className="card-body">
                            <div className="card-name-row">
                              <span className="card-name">
                                {discoverDuos[currentDuoIndex]?.members?.[1]?.name || "Partner"}, {discoverDuos[currentDuoIndex]?.members?.[1]?.age || 22}
                              </span>
                            </div>
                            <p className="card-bio" style={{ fontSize: '13px', color: '#888', marginTop: '4px', minHeight: '32px' }}>
                              {discoverDuos[currentDuoIndex]?.members?.[1]?.bio || "No bio description entered."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="step-footer text-center" style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
                    <button type="button" className="btn-secondary" onClick={handleLeaveDuo}>← Back to Invite Partner</button>
                  </div>
                </div>
              ) : (
                <div className="match-success-fullpage">
                  <div className="match-success-flow">
                    <div className="step-header text-center">
                      <div className="celebration-icon">🎉</div>
                      <h1 className="step-title color-accent">Double Match!</h1>
                      <p className="step-description">
                        All four members verified interaction clearance. Group chat channel access initialized.
                      </p>
                    </div>

                    <div className="match-identity-bridge">
                      <div className="team-node">
                        <div className="mini-avatars">
                          <div className="mini-avatar bg-purple">{myProfile?.name?.charAt(0).toUpperCase() || "Y"}</div>
                          <div className="mini-avatar bg-pink">{partnerProfile?.name?.charAt(0).toUpperCase() || "P"}</div>
                        </div>
                        <span className="team-label">Your Duo</span>
                      </div>

                      <div className="connection-vector">
                        <div className="vector-line"></div>
                        <span className="vector-tag">MUTUAL</span>
                      </div>

                      <div className="team-node">
                        <div className="mini-avatars">
                          <div className="mini-avatar bg-cyan">{matchedDuoData?.members?.[0]?.name?.charAt(0).toUpperCase() || "T"}</div>
                          <div className="mini-avatar bg-yellow">{matchedDuoData?.members?.[1]?.name?.charAt(0).toUpperCase() || "F"}</div>
                        </div>
                        <span className="team-label">{matchedDuoData?.members?.[0]?.name || "Their"} & {matchedDuoData?.members?.[1]?.name || "Duo"}</span>
                      </div>
                    </div>

                    <div className="revealed-users-grid">
                      <div className="user-capsule-card" style={{
                        backgroundImage: matchedDuoData?.members?.[0]?.photos?.[0] ? `url(${getPhotoUrl(matchedDuoData.members[0].photos[0])})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}>
                        <div className="user-capsule-overlay">
                          <span className="user-meta-name">{matchedDuoData?.members?.[0]?.name}, {matchedDuoData?.members?.[0]?.age}</span>
                          <span className="user-meta-handle">{matchedDuoData?.members?.[0]?.bio ? (matchedDuoData.members[0].bio.substring(0, 30) + "...") : "No bio"}</span>
                        </div>
                      </div>
                      <div className="user-capsule-card" style={{
                        backgroundImage: matchedDuoData?.members?.[1]?.photos?.[0] ? `url(${getPhotoUrl(matchedDuoData.members[1].photos[0])})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}>
                        <div className="user-capsule-overlay">
                          <span className="user-meta-name">{matchedDuoData?.members?.[1]?.name}, {matchedDuoData?.members?.[1]?.age}</span>
                          <span className="user-meta-handle">{matchedDuoData?.members?.[1]?.bio ? (matchedDuoData.members[1].bio.substring(0, 30) + "...") : "No bio"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="chat-preview-box">
                      <div className="chat-box-header">
                        <div className="system-status-dots">
                          <span></span><span></span><span></span>
                        </div>
                        <span className="chat-box-title">Group Chat Session</span>
                      </div>

                      <div className="chat-messages-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {messages.length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                            No messages yet. Say hi to start the conversation!
                          </div>
                        ) : (
                          messages.map((msg, idx) => (
                            <div key={idx} className={`message-row ${msg.senderEmail === email ? 'outgoing' : 'incoming'}`}>
                              {msg.senderEmail !== email && (
                                <span className="message-sender">{msg.senderName}</span>
                              )}
                              <p className="message-bubble">{msg.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Type a message..."
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', padding: '8px 12px' }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Send</button>
                      </form>
                    </div>

                    <div className="action-buttons-group">
                      <button type="button" className="btn-secondary" onClick={() => alert('Matches: Double Match verified in database.')}>
                        View match details
                      </button>
                      <button type="button" className="btn-primary" onClick={() => alert('Full screen chat coming soon!')}>
                        Open group chat →
                      </button>
                    </div>

                    <div className="step-footer text-center" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                      <button type="button" className="btn-secondary" onClick={() => setIsMatched(false)}>← Back to Swipe Arena</button>
                      <button type="button" className="btn-ghost btn-sm" onClick={async () => {
                        setIsMatched(false);
                        await handleLeaveDuo();
                      }}>← Back to Invite Partner</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CreateDuo;