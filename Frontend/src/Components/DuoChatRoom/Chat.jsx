import { useState, useEffect, useRef } from 'react';
import './Chat.css';

const Chat = ({ email }) => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const prevMatchIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const userSentRef = useRef(false);

  const getPhotoUrl = (photo) => {
    if (!photo) return "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80";
    if (photo.startsWith("http")) return photo;
    return `http://localhost:3000/uploads/${photo}`;
  };

  const fetchMatches = async () => {
    if (!email) return;
    try {
      const response = await fetch(`http://localhost:3000/api/duo/matches?email=${email}`);
      const data = await response.json();
      if (response.ok) {
        const matchesList = data.matches || [];
        setMatches(matchesList);
        
        // Sync selected match details if already selected
        if (selectedMatch) {
          const updated = matchesList.find(m => m.matchId === selectedMatch.matchId);
          if (updated) {
            setSelectedMatch(updated);
          } else {
            setSelectedMatch(null);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching matches in Chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (matchId) => {
    if (!matchId) return;
    try {
      const response = await fetch(`http://localhost:3000/api/duo/messages?matchId=${matchId}`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching messages in Chat:", err);
    }
  };

  const handleInitiateRequest = async (matchId) => {
    if (!email || !matchId) return;
    try {
      const response = await fetch('http://localhost:3000/api/duo/chat-requests/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, initiatorEmail: email })
      });
      if (response.ok) {
        await fetchMatches();
      } else {
        alert("Failed to initiate chat request.");
      }
    } catch (err) {
      console.error("Error initiating chat request:", err);
    }
  };

  const handleAcceptMemberRequest = async (matchId) => {
    if (!email || !matchId) return;
    try {
      const response = await fetch('http://localhost:3000/api/duo/chat-requests/accept-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, memberEmail: email })
      });
      if (response.ok) {
        await fetchMatches();
      } else {
        alert("Failed to record acceptance.");
      }
    } catch (err) {
      console.error("Error accepting member request:", err);
    }
  };

  const handleRejectMatchRequest = async (matchId) => {
    if (!matchId) return;
    try {
      const response = await fetch('http://localhost:3000/api/duo/chat-requests/reject-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId })
      });
      if (response.ok) {
        setSelectedMatch(null);
        await fetchMatches();
        alert("Duo match rejected and cleared. Returning to Swipe Arena...");
        window.location.search = '?tab=discover'; // return to swipe arena
      } else {
        alert("Failed to reject chat request.");
      }
    } catch (err) {
      console.error("Error rejecting match:", err);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedMatch || !email) return;

    userSentRef.current = true;
    try {
      const response = await fetch('http://localhost:3000/api/duo/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatch.matchId,
          senderEmail: email,
          text: newMessage
        })
      });
      if (response.ok) {
        setNewMessage('');
        await fetchMessages(selectedMatch.matchId);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Initial load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMatches();
  }, [email]);

  // Polling for matches and current chat messages
  useEffect(() => {
    const matchesInterval = setInterval(() => {
      fetchMatches();
    }, 5000);

    return () => clearInterval(matchesInterval);
  }, [selectedMatch, email]);

  useEffect(() => {
    let msgInterval;
    if (selectedMatch && selectedMatch.chatStatus === 'active') {
      fetchMessages(selectedMatch.matchId);
      msgInterval = setInterval(() => {
        fetchMessages(selectedMatch.matchId);
      }, 3000);
    } else {
      setMessages([]);
    }

    return () => {
      if (msgInterval) clearInterval(msgInterval);
    };
  }, [selectedMatch]);

  // Scroll chat to bottom smart logic (handles scrolling up to read history)
  useEffect(() => {
    if (!selectedMatch) {
      prevMatchIdRef.current = null;
      prevMessagesLengthRef.current = 0;
      return;
    }

    const matchIdChanged = prevMatchIdRef.current !== selectedMatch.matchId;
    const messagesCountChanged = messages.length !== prevMessagesLengthRef.current;

    prevMatchIdRef.current = selectedMatch.matchId;
    prevMessagesLengthRef.current = messages.length;

    const container = scrollContainerRef.current;
    if (!container) return;

    if (matchIdChanged) {
      // Scroll to bottom immediately when switching chats
      container.scrollTop = container.scrollHeight;
      return;
    }

    if (messagesCountChanged) {
      // Check if user is scrolled near the bottom (within 150px of bottom)
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      
      // Scroll to bottom if user is near bottom, or if the user just sent a message
      if (isNearBottom || userSentRef.current) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
      // Reset userSentRef
      userSentRef.current = false;
    }
  }, [messages, selectedMatch]);

  const selectMatchItem = (match) => {
    setSelectedMatch(match);
    setIsSidebarOpen(false);
  };

  // Categorize matches
  const activeChats = matches.filter(m => m.chatStatus === 'active');
  const pendingChats = matches.filter(m => m.chatStatus === 'pending');
  const newMatches = matches.filter(m => m.chatStatus === 'none');

  // Format header display names containing all 4 participants
  const getDisplayHeaderNames = () => {
    if (!selectedMatch) return '';
    const myNames = (selectedMatch.myMembers || []).map(m => m.email === email ? 'You' : m.name);
    const otherNames = (selectedMatch.members || []).map(m => m.name);
    const allNames = [...myNames, ...otherNames].filter(Boolean);
    if (allNames.length === 0) return '';
    if (allNames.length === 1) return allNames[0];
    if (allNames.length === 2) return `${allNames[0]} & ${allNames[1]}`;
    return `${allNames.slice(0, -1).join(', ')} & ${allNames[allNames.length - 1]}`;
  };

  const displayHeaderNames = getDisplayHeaderNames();

  if (loading) {
    return (
      <div className="chat-empty-state" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="spinner-mini" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
        <p className="empty-state-subtitle" style={{ marginTop: '16px' }}>Loading chats...</p>
      </div>
    );
  }

  return (
    <div className={`chat-dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      
      {/* SIDEBAR */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Duo Chats</h2>
          <p className="sidebar-subtitle">Interact with double matches</p>
        </div>

        <div className="sidebar-section-container">
          
          {/* ACTIVE CONVERSATIONS */}
          <div className="sidebar-section">
            <div className="section-title-row">
              <span className="section-label">Active Conversations</span>
              {activeChats.length > 0 && <span className="section-count">{activeChats.length}</span>}
            </div>
            <div className="sidebar-list">
              {activeChats.length === 0 ? (
                <div style={{ padding: '8px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  No active group chats.
                </div>
              ) : (
                activeChats.map(m => (
                  <button
                    key={m.matchId}
                    type="button"
                    className={`sidebar-item-card ${selectedMatch?.matchId === m.matchId ? 'active' : ''}`}
                    onClick={() => selectMatchItem(m)}
                  >
                    <div className="card-avatar-overlap">
                      <img src={getPhotoUrl(m.members?.[0]?.photos?.[0])} alt="M1" className="avatar-small av-first" />
                      <img src={getPhotoUrl(m.members?.[1]?.photos?.[0])} alt="M2" className="avatar-small av-second" />
                    </div>
                    <div className="card-info-col">
                      <div className="card-title-text">
                        {m.members?.[0]?.name} &amp; {m.members?.[1]?.name}
                      </div>
                      <div className="card-status-desc">
                        <span className="status-indicator-dot active"></span>
                        Live Group Chat Open
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* PENDING GROUP REQUESTS */}
          <div className="sidebar-section">
            <div className="section-title-row">
              <span className="section-label">Pending Consensus</span>
              {pendingChats.length > 0 && (
                <span className="section-count" style={{ background: 'rgba(255, 209, 102, 0.15)', color: 'var(--accent-yellow)', borderColor: 'rgba(255, 209, 102, 0.2)' }}>
                  {pendingChats.length}
                </span>
              )}
            </div>
            <div className="sidebar-list">
              {pendingChats.length === 0 ? (
                <div style={{ padding: '8px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  No pending group requests.
                </div>
              ) : (
                pendingChats.map(m => {
                  const acceptedCount = m.acceptances?.length || 0;
                  const hasAccepted = m.acceptances?.includes(email);

                  return (
                    <button
                      key={m.matchId}
                      type="button"
                      className={`sidebar-item-card ${selectedMatch?.matchId === m.matchId ? 'active' : ''}`}
                      onClick={() => selectMatchItem(m)}
                    >
                      <div className="card-avatar-overlap">
                        <img src={getPhotoUrl(m.members?.[0]?.photos?.[0])} alt="M1" className="avatar-small av-first" />
                        <img src={getPhotoUrl(m.members?.[1]?.photos?.[0])} alt="M2" className="avatar-small av-second" />
                      </div>
                      <div className="card-info-col">
                        <div className="card-title-text">
                          {m.members?.[0]?.name} &amp; {m.members?.[1]?.name}
                        </div>
                        <div className="card-status-desc" style={{ color: hasAccepted ? '#888' : 'var(--accent-yellow)' }}>
                          <span className={`status-indicator-dot pending`} style={{ backgroundColor: hasAccepted ? '#777' : 'var(--accent-yellow)' }}></span>
                          {acceptedCount}/4 Accepted {hasAccepted ? '(Waiting)' : '(Need review)'}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* NEW MATCHES (YET TO INITIATE) */}
          <div className="sidebar-section">
            <div className="section-title-row">
              <span className="section-label">New Matches</span>
              {newMatches.length > 0 && (
                <span className="section-count" style={{ background: 'rgba(0, 229, 195, 0.15)', color: '#00e5c3', borderColor: 'rgba(0, 229, 195, 0.2)' }}>
                  {newMatches.length}
                </span>
              )}
            </div>
            <div className="sidebar-list">
              {newMatches.length === 0 ? (
                <div style={{ padding: '8px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  No new double matches.
                </div>
              ) : (
                newMatches.map(m => (
                  <button
                    key={m.matchId}
                    type="button"
                    className={`sidebar-item-card ${selectedMatch?.matchId === m.matchId ? 'active' : ''}`}
                    onClick={() => selectMatchItem(m)}
                  >
                    <div className="card-avatar-overlap">
                      <img src={getPhotoUrl(m.members?.[0]?.photos?.[0])} alt="M1" className="avatar-small av-first" />
                      <img src={getPhotoUrl(m.members?.[1]?.photos?.[0])} alt="M2" className="avatar-small av-second" />
                    </div>
                    <div className="card-info-col">
                      <div className="card-title-text">
                        {m.members?.[0]?.name} &amp; {m.members?.[1]?.name}
                      </div>
                      <div className="card-status-desc">
                        <span className="status-indicator-dot none"></span>
                        Tap to start request
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>
      </aside>

      {/* MAIN PANE */}
      <main className="chat-main-pane">
        {!selectedMatch ? (
          /* EMPTY STATE */
          <div className="chat-empty-state">
            <div className="empty-state-icon">💬</div>
            <h3 className="empty-state-title">Select a Conversation</h3>
            <p className="empty-state-subtitle">
              Choose a match from the sidebar to coordinate acceptance consensus or chat with the group!
            </p>
          </div>
        ) : (
          /* CHAT OR REQUEST ACTION VIEWS */
          <>
            {/* PANEL HEADER */}
            <div className="chat-pane-header">
              <div className="header-meta-left">
                <button
                  type="button"
                  className="back-btn-mobile"
                  onClick={() => setIsSidebarOpen(true)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <i className="ti ti-arrow-left"></i> Back
                </button>
                <div className="header-identity-col">
                  <h3 className="header-partner-names">
                    {displayHeaderNames}
                  </h3>
                  <div className="header-match-tagline">
                    <span>Double Match</span> · 
                    <span className="tag-compatibility">⭐ 78% compatibility</span>
                  </div>
                </div>
              </div>
            </div>

            {/* IF CHAT IS ACTIVE */}
            {selectedMatch.chatStatus === 'active' && (
              <>
                <div ref={scrollContainerRef} className="messages-scroll-area">
                  {messages.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                      <span style={{ fontSize: '32px', marginBottom: '12px' }}>✨</span>
                      <span>This is the start of your double date conversation. Say hello!</span>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOutgoing = msg.senderEmail === email;
                      
                      let senderClass = '';
                      if (!isOutgoing) {
                        if (msg.senderEmail === selectedMatch.members?.[0]?.email) {
                          senderClass = 'partner-first';
                        } else {
                          senderClass = 'partner-second';
                        }
                      }

                      return (
                        <div key={index} className={`msg-row-wrapper ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                          {!isOutgoing && (
                            <span className={`msg-sender-label ${senderClass}`}>
                              {msg.senderName}
                            </span>
                          )}
                          <div className="msg-bubble-main">
                            {msg.text}
                          </div>
                          <span className="msg-timestamp-meta">
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* TEXT INPUT BAR */}
                <form onSubmit={handleSendMessage} className="chat-action-input-bar">
                  <input
                    type="text"
                    className="chat-text-input"
                    placeholder="Message the group..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="chat-send-icon-btn">
                    <i className="ti ti-send" style={{ fontSize: '18px' }}></i>
                  </button>
                </form>
              </>
            )}

            {/* IF CHAT IS YET TO BE INITIATED */}
            {selectedMatch.chatStatus === 'none' && (
              <div className="request-detail-view">
                <div className="request-card-hero">
                  <span className="request-heart-badge">💖</span>
                  <h2 className="request-hero-title">Matched!</h2>
                  <p className="request-hero-tagline">
                    Send a request to start a live group chat. All members from both duos must accept to unlock the chat room.
                  </p>

                  <div className="request-overlap-avatars">
                    <img src={getPhotoUrl(selectedMatch.members?.[0]?.photos?.[0])} alt="M1" className="avatar-large av-l-first" />
                    <img src={getPhotoUrl(selectedMatch.members?.[1]?.photos?.[0])} alt="M2" className="avatar-large av-l-second" />
                  </div>

                  <div className="request-action-row">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleInitiateRequest(selectedMatch.matchId)}
                    >
                      🚀 Send Request to Group
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleRejectMatchRequest(selectedMatch.matchId)}
                    >
                      Decline &amp; Delete Match
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* IF CHAT IS PENDING (CONSENSUS BUILDING STATE) */}
            {selectedMatch.chatStatus === 'pending' && (
              <div className="request-detail-view">
                <div className="request-card-hero">
                  <span className="request-heart-badge">⏳</span>
                  <h2 className="request-hero-title">Group Chat Request</h2>
                  <p className="request-hero-tagline" style={{ marginBottom: '16px' }}>
                    Coordinate consensus with all 4 participants. Chat opens when everyone accepts.
                  </p>

                  {/* 4-MEMBER ACCEPTANCE CHECKS GRID */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    width: '100%',
                    background: 'var(--bg-input, #121324)',
                    border: '1px solid var(--border-color, #2a2b40)',
                    padding: '16px',
                    borderRadius: '16px',
                    boxSizing: 'border-box',
                    marginBottom: '24px',
                    textAlign: 'left'
                  }}>
                    {/* Render My Duo Members */}
                    {(selectedMatch.myMembers || []).map((m, idx) => {
                      const accepted = selectedMatch.acceptances?.includes(m.email);
                      return (
                        <div key={`my-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <span style={{ fontSize: '16px' }}>{accepted ? '✅' : '⏳'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {m.email === email ? 'You' : m.name}
                          </span>
                        </div>
                      );
                    })}

                    {/* Render Opposing Duo Members */}
                    {(selectedMatch.members || []).map((m, idx) => {
                      const accepted = selectedMatch.acceptances?.includes(m.email);
                      return (
                        <div key={`opp-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <span style={{ fontSize: '16px' }}>{accepted ? '✅' : '⏳'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {m.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* ACTION CONTROLS */}
                  {selectedMatch.acceptances?.includes(email) ? (
                    /* ALREADY ACCEPTED STATE */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                      <div className="request-pending-info">
                        <div className="spinner-mini"></div>
                        <p className="request-pending-text">
                          You have accepted! Waiting for remaining members to accept...
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleRejectMatchRequest(selectedMatch.matchId)}
                      >
                        Cancel Request &amp; Swipe Again
                      </button>
                    </div>
                  ) : (
                    /* NOT ACCEPTED YET STATE */
                    <div className="request-action-row">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleAcceptMemberRequest(selectedMatch.matchId)}
                      >
                        ✅ Accept Group Chat
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleRejectMatchRequest(selectedMatch.matchId)}
                      >
                        Decline &amp; Clear Match
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

          </>
        )}
      </main>

    </div>
  );
};

export default Chat;