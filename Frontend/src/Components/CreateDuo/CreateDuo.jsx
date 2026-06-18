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

  // Gallery navigation states for the Step 2 dashboard view
  const [myPhotoIndex, setMyPhotoIndex] = useState(0);
  const [friendPhotoIndex, setFriendPhotoIndex] = useState(0);

  const me = {
    username: "Dharm",
    age: 23,
    profilePic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"
    ],
    bio: "Full stack engineer. Coffee enthusiast, occasional runner, and constantly building side projects in React."
  };

  const friend = {
    username: "Rohan",
    age: 24,
    profilePic: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
    ],
    bio: "Product designer passionate about typography, clean interfaces, and finding the best street food spots."
  };

  // Fallback mock lists if DB is empty
  const mockIncomingLikes = [
    {
      id: "mock_duo_1",
      members: [
        { name: "Emma", age: 24, photos: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80"], bio: "Travel enthusiast looking for coffee and double dates." },
        { name: "Sophia", age: 23, photos: ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80"], bio: "Always down for weekend hikes and exploring new cafes." }
      ],
      compatibility: 96,
      timestamp: "2 hours ago"
    }
  ];

  const mockMyLikes = [
    {
      id: "mock_duo_2",
      members: [
        { name: "Morgan", age: 25, photos: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"], bio: "Product designer, loves typography and clean design." },
        { name: "Riley", age: 26, photos: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80"], bio: "React engineer, travel photography nerd." }
      ],
      compatibility: 85,
      timestamp: "1 day ago"
    }
  ];

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const statusRes = await fetch(`http://localhost:3000/api/duo/status?email=${email}`);
        const statusData = await statusRes.json();
        if (statusRes.ok) {
          setDuoStatus(statusData.status);
          if (statusData.status === 'in_duo') {
            setStep(2);
            setIsInviteModalOpen(false);
          } else {
            setStep(1);
            if (activeTab === 'discover') {
              setIsInviteModalOpen(true);
            }
          }
        }

        const interestsRes = await fetch(`http://localhost:3000/api/duo/interests?email=${email}`);
        const intData = await interestsRes.json();
        if (interestsRes.ok) {
          setInterestsData(intData);
        }
      } catch (err) {
        console.error("Error fetching duo data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email, activeTab]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length > 2) {
      setIsInviteSent(true);
    } else {
      setIsInviteSent(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText("duodate.app/invite/dharm-x7k2p");
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

  const handleNextPhoto = (target) => {
    if (target === 'me') {
      setMyPhotoIndex((prev) => (prev + 1) % me.photos.length);
    } else {
      setFriendPhotoIndex((prev) => (prev + 1) % friend.photos.length);
    }
  };

  const handleAcceptInvite = async () => {
    if (email) {
      try {
        await fetch('http://localhost:3000/api/duo/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderEmail: email,
            receiverEmail: 'rohan@gmail.com'
          })
        });
      } catch (err) {
        console.error("Duo accept error:", err);
      }
    }

    setIsInviteModalOpen(false);
    setAnimationClass('slide-out');
    setTimeout(() => {
      setDuoStatus('in_duo');
      setStep(2);
      setAnimationClass('slide-in');
      setTimeout(() => {
        setAnimationClass('');
      }, 500);
    }, 500);
  };

  const handleMatchBack = async (targetDuoId) => {
    if (email) {
      try {
        await fetch('http://localhost:3000/api/duo/swipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            swiperEmail: email,
            targetDuoId: targetDuoId,
            action: 'like'
          })
        });
      } catch (err) {
        console.error("Match back error:", err);
      }
    }
    setIsMatched(true);
    setStep(2);
  };

  const defaultAvatar = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80";
  const incomingLikes = interestsData.incoming_likes.length > 0 ? interestsData.incoming_likes : mockIncomingLikes;
  const myLikes = interestsData.my_likes.length > 0 ? interestsData.my_likes : mockMyLikes;

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
                  {incomingLikes.map((duo) => (
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
                              <img src={m.photos?.[0] || defaultAvatar} alt={m.name} className="avatar-img" />
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
                  ))}
                </div>
              ) : (
                <div className="interests-grid">
                  {myLikes.map((duo) => (
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
                              <img src={m.photos?.[0] || defaultAvatar} alt={m.name} className="avatar-img" />
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
                  ))}
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

                      <div className="divider-row">
                        <span className="divider-text">or share your link</span>
                      </div>

                      <div className="link-share-box">
                        <span className="link-url">duodate.app/invite/dharm-x7k2p</span>
                        <button type="button" className="btn-secondary btn-sm" onClick={copyInviteLink}>
                          {copyStatus}
                        </button>
                      </div>

                      {isInviteSent && (
                        <div className="status-alert-box alert-pending">
                          <div className="alert-header">
                            <span className="pulse-indicator"></span>
                            <span className="alert-title">Request Pending</span>
                          </div>
                          <p className="alert-body">
                            Waiting for <strong>Rohan</strong> to accept your invite request and enter the lobby...
                          </p>
                          <button 
                            type="button" 
                            className="btn-primary w-100" 
                            onClick={handleAcceptInvite}
                          >
                            Accept Invite & Enter Swipe Arena →
                          </button>
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

                  <div className="swipe-arena full-width-arena">
                    {/* YOUR DUO */}
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

                    {/* COMPATIBILITY MATCH ZONE */}
                    <div className="match-zone">
                      <div className="match-indicator">
                        <div className="match-indicator-title">Compatibility</div>
                        <div className="match-indicator-val">73%</div>
                        <div className="match-indicator-sub">Group score</div>
                      </div>
                      <div className="vs-divider">VS</div>
                      <div className="swipe-btn-group">
                        <button type="button" className="swipe-btn nope" onClick={() => alert("Simulated: You skipped this duo.")}>
                          Pass
                        </button>
                        <button type="button" className="swipe-btn like" onClick={() => setIsMatched(true)}>
                          ❤️ Both Like
                        </button>
                        <button type="button" className="swipe-btn super" onClick={() => { setIsMatched(true); alert("Super Like sent!"); }}>
                          ⭐ Super Like
                        </button>
                      </div>
                    </div>

                    {/* THEIR DUO */}
                    <div className="duo-stack">
                      <div className="duo-label">
                        Their duo <span className="duo-badge them">THEM + FRIEND</span>
                      </div>
                      <div className="profile-card matched">
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

                  <div className="step-footer text-center" style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
                    <button type="button" className="btn-secondary" onClick={() => {
                      setStep(1);
                      setDuoStatus('solo');
                    }}>← Back to Invite Partner</button>
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
                          <div className="mini-avatar bg-purple">D</div>
                          <div className="mini-avatar bg-pink">R</div>
                        </div>
                        <span className="team-label">Your Duo</span>
                      </div>

                      <div className="connection-vector">
                        <div className="vector-line"></div>
                        <span className="vector-tag">MUTUAL</span>
                      </div>

                      <div className="team-node">
                        <div className="mini-avatars">
                          <div className="mini-avatar bg-cyan">M</div>
                          <div className="mini-avatar bg-yellow">R</div>
                        </div>
                        <span className="team-label">Morgan & Riley</span>
                      </div>
                    </div>

                    <div className="revealed-users-grid">
                      <div className="user-capsule-card image-placeholder-1">
                        <div className="user-capsule-overlay">
                          <span className="user-meta-name">Morgan, 25</span>
                          <span className="user-meta-handle">@morgan.m · Designer</span>
                        </div>
                      </div>
                      <div className="user-capsule-card image-placeholder-2">
                        <div className="user-capsule-overlay">
                          <span className="user-meta-name">Riley, 26</span>
                          <span className="user-meta-handle">@riley.r · Engineer</span>
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

                      <div className="chat-messages-container">
                        <div className="message-row incoming">
                          <span className="message-sender sender-morgan">Morgan</span>
                          <p className="message-bubble">omg hi!! we've been hoping to match with a duo like yours 🎉</p>
                        </div>
                        <div className="message-row incoming">
                          <span className="message-sender sender-kiran">Riley</span>
                          <p className="message-bubble">two devs + two designers = the perfect chaos 😄 anyone free Sunday?</p>
                        </div>
                        <div className="message-row outgoing">
                          <p className="message-bubble">Sunday works! know any good rooftop spots in Koramangala? ☕</p>
                        </div>
                      </div>
                    </div>

                    <div className="action-buttons-group">
                      <button type="button" className="btn-secondary" onClick={() => alert('Opening parameters...')}>
                        View match details
                      </button>
                      <button type="button" className="btn-primary" onClick={() => window.open('/group-chat', '_blank')}>
                        Open group chat →
                      </button>
                    </div>

                    <div className="step-footer text-center" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                      <button type="button" className="btn-secondary" onClick={() => setIsMatched(false)}>← Back to Swipe Arena</button>
                      <button type="button" className="btn-ghost btn-sm" onClick={() => {
                        setIsMatched(false);
                        setStep(1);
                        setDuoStatus('solo');
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