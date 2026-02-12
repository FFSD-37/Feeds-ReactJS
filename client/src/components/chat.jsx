import { useEffect, useState, useRef, useCallback } from 'react';
import '../styles/chat.css';
import { useUserData } from '../providers/userData';
import socket from '../socket';
import EmojiPicker from 'emoji-picker-react';
import { HexColorPicker } from 'react-colorful';

/*
ISSUES/Improvements:
1) Unite wallpaper and colour pallete in one thing
2) when in mobile, users and chatbox not seen (Improve responsivess)
3) Add delivered and seen feature in chats
4) Change class/id names to start with chat
5) When newly loaded, the image(wallpaper) is not seen until changed
6) Permanent memory of wallpaper to be added (database)
7) Only Premium users can change wallpaper and colours
8) Fix color-popover and emoji-popover position/styling
9) Integrate Chats with channels
*/

export default function ChatPage() {
  const { userData } = useUserData();
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [friends, setFriends] = useState([]);
  const chatBoxRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef(null);
  const [showColor, setShowColor] = useState(false);
  const [bgColor, setBgColor] = useState('#020617');
  const colorRef = useRef(null);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);

  const scrollBottom = useCallback(() => {
    const el = chatBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    const handler = msg => {
      if (msg.from === activeUser) {
        setMessages(prev => [...prev, msg]);
        scrollBottom();
      }
    };

    socket.on('receiveMessage', handler);
    return () => socket.off('receiveMessage', handler);
  }, [activeUser, scrollBottom]);

  // Load friend list only once
  useEffect(() => {
    async function loadFriends() {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/friends`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();
        setFriends(data.friends || []);
      } catch (err) {
        console.error('Failed to load friends', err);
      }
    }

    loadFriends();
  }, []);

  // Load chats for selected friend
  const loadMessages = async username => {
    setActiveUser(username);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/chat/${username}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await res.json();
      const chats = data.chats || [];

      const filtered = chats.filter(
        m => m.from === username || m.from === userData.username,
      );

      setMessages(filtered);
      setTimeout(scrollBottom, 50);
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!input.trim() || !activeUser) return;

    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const time = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateTime = `${date} ${time}`;

    const newMsg = {
      text: input,
      from: userData.username,
      dateTime,
    };

    socket.emit('sendMessage', {
      to: activeUser,
      text: input,
      dateTime,
    });

    setMessages(prev => [...prev, newMsg]);
    setInput('');
    scrollBottom();
  };

  const groupByDate = msgs => {
    const map = {};
    msgs.forEach(m => {
      const raw = m.dateTime || m.createdAt;
      const d = new Date(raw).toDateString();
      if (!map[d]) map[d] = [];
      map[d].push(m);
    });
    return map;
  };

  useEffect(() => {
    // apply bgColor or previously saved background (color or url)
    const saved = localStorage.getItem('chatBg');
    if (saved) {
      document.documentElement.style.setProperty('--chat-bg', saved);
      // if saved is a color value keep bgColor for the picker
      if (!saved.startsWith('url(')) setBgColor(saved);
    } else {
      document.documentElement.style.setProperty('--chat-bg', bgColor);
    }
  }, [bgColor]);

  useEffect(() => {
    const close = e => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    const close = e => {
      if (colorRef.current && !colorRef.current.contains(e.target)) {
        setShowColor(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Escape') {
        setShowEmoji(false);
        setShowColor(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '90vw' }}>
      {/* Sidebar */}
      <div className="chat-list">
        <div className="chat-me">{userData.username}</div>

        {friends.map(friend => (
          <div
            key={friend.username}
            className={`chat-user ${activeUser === friend.username ? 'active' : ''}`}
            onClick={() => loadMessages(friend.username)}
          >
            <img src={friend.avatarUrl} alt="" />
            <span>{friend.username}</span>
          </div>
        ))}

        <a href="/home" className="chat-back-button">
          ← Back to Home
        </a>
      </div>

      {/* Conversation area */}
      <div className="chat-area">
        <div className="chat-header">
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <button className="chat-toggle" onClick={() => setShowSidebarMobile(true)}>☰</button>
            <span>{activeUser}</span>
          </div>
          <div className="chat-bg-controls">
            <select
              onChange={e => {
                const v = `url(${e.target.value})`;
                document.documentElement.style.setProperty('--chat-bg', v);
                localStorage.setItem('chatBg', v);
              }}
            >
            <option value="https://img.freepik.com/free-vector/night-ocean-landscape-full-moon-stars-shine_107791-7397.jpg?semt=ais_hybrid&w=740">
              🌃 Night Scene
            </option>
            <option value="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=800&fit=crop">
              🌙 Night Sky
            </option>
            <option value="https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=1200&h=800&fit=crop">
              💜 Purple Gradient
            </option>
            <option value="https://images.unsplash.com/photo-1557672172-298e090d0f80?w=1200&h=800&fit=crop">
              ⬛ Dark Minimal
            </option>
            <option value="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop">
              🌊 Ocean Blue
            </option>
            <option value="https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1200&h=800&fit=crop">
              🌅 Sunset
            </option>
            <option value="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop">
              🌲 Forest
            </option>
            <option value="https://images.unsplash.com/photo-1533709752211-118fcffe3312?w=1200&h=800&fit=crop">
              ✨ Lights
            </option>
            </select>
            <div className="chat-color-wrapper" ref={colorRef}>
              <button
                className="chat-color-btn"
                onClick={e => {
                  e.stopPropagation();
                  setShowEmoji(false);
                  setShowColor(p => !p);
                }}
                title="Pick background color"
              >
                🎨
              </button>

              {showColor && (
                <div className="chat-color-popover">
                  <HexColorPicker
                    color={bgColor}
                    onChange={c => {
                      setBgColor(c);
                      document.documentElement.style.setProperty('--chat-bg', c);
                      localStorage.setItem('chatBg', c);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="chat-messages" ref={chatBoxRef}>
          {!activeUser ? (
            <div className="chat-empty-state">Select a user to start chatting</div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              No messages yet. Start the conversation.
            </div>
          ) : (
            Object.entries(groupByDate(messages)).map(([date, msgs]) => (
              <div key={date} className="chat-date-group">
                  <div className="chat-date-separator">{date}</div>
                {msgs.map((msg, i) => (
                  <div
                    key={i}
                    className={`chat-message ${msg.from === userData.username ? 'sent' : 'received'}`}
                  >
                      <div className="chat-bubble">
                        <div>{msg.text}</div>
                        <div className="chat-timestamp-inline">
                          {(msg.dateTime || msg.createdAt)
                            .split(' ')
                            .slice(-2)
                            .join(' ')}
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Input */}
        {activeUser && (
          <div className="chat-controls">
            <div className="chat-input-area">
              <div className="chat-emoji-wrapper" ref={emojiRef}>
                <button
                  className="chat-emoji-btn"
                  onClick={e => {
                    e.stopPropagation();
                    setShowColor(false);
                    setShowEmoji(p => !p);
                  }}
                >
                  😊
                </button>

                {showEmoji && (
                  <div className="chat-emoji-popover">
                    <EmojiPicker
                      theme="dark"
                      onEmojiClick={e => {
                        setInput(prev => prev + e.emoji);
                      }}
                      searchDisabled={false}
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}
              </div>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />

              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
      {/* Mobile sidebar overlay */}
      {showSidebarMobile && (
        <div className={`chat-list mobile-open`}>
          <button className="chat-mobile-close" onClick={() => setShowSidebarMobile(false)}>✕</button>
          <div className="chat-me">{userData.username}</div>

          {friends.map(friend => (
            <div
              key={friend.username}
              className={`chat-user ${activeUser === friend.username ? 'active' : ''}`}
              onClick={() => {
                loadMessages(friend.username);
                if (window.innerWidth <= 640) setShowSidebarMobile(false);
              }}
            >
              <img src={friend.avatarUrl} alt="" />
              <span>{friend.username}</span>
            </div>
          ))}

          <a href="/home" className="chat-back-button">
            ← Back to Home
          </a>
        </div>
      )}
    </div>
  );
}
