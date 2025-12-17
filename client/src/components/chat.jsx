import { useEffect, useState, useRef, useCallback } from 'react';
import '../styles/chat.css';
import { useUserData } from '../providers/userData';
import socket from '../socket';

export default function ChatPage() {
  const { userData } = useUserData();
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [friends, setFriends] = useState([]);
  const chatBoxRef = useRef(null);

  const scrollBottom = useCallback(() => {
    const el = chatBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    socket.on('receiveMessage', msg => {
      if (msg.from === activeUser) {
        setMessages(prev => [...prev, msg]);
        scrollBottom();
      }
    });
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
      const d = (m.dateTime || m.createdAt).split(',')[0];
      if (!map[d]) map[d] = [];
      map[d].push(m);
    });
    return map;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '90vw' }}>
      {/* Sidebar */}
      <div className="chatList">
        <div className="me">{userData.username}</div>

        {friends.map(friend => (
          <div
            key={friend.username}
            className={`user ${activeUser === friend.username ? 'active' : ''}`}
            onClick={() => loadMessages(friend.username)}
          >
            <img src={friend.avatarUrl} alt="" />
            <span>{friend.username}</span>
          </div>
        ))}

        <a href="/home" className="back-button">
          ← Back to Home
        </a>
      </div>

      {/* Conversation area */}
      <div className="chat-area">
        <div className="chat-header">
          <span>{activeUser}</span>
          <select
            onChange={e =>
              document.documentElement.style.setProperty(
                '--chat-bg',
                `url(${e.target.value})`,
              )
            }
          >
            <option value="https://img.freepik.com/free-vector/night-ocean-landscape-full-moon-stars-shine_107791-7397.jpg?semt=ais_hybrid&w=740">🌃 Night Scene</option>
            <option value="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=800&fit=crop">🌙 Night Sky</option>
            <option value="https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=1200&h=800&fit=crop">💜 Purple Gradient</option>
            <option value="https://images.unsplash.com/photo-1557672172-298e090d0f80?w=1200&h=800&fit=crop">⬛ Dark Minimal</option>
            <option value="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop">🌊 Ocean Blue</option>
            <option value="https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1200&h=800&fit=crop">🌅 Sunset</option>
            <option value="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop">🌲 Forest</option>
            <option value="https://images.unsplash.com/photo-1533709752211-118fcffe3312?w=1200&h=800&fit=crop">✨ Lights</option>
          </select>
        </div>

        <div className="messages" ref={chatBoxRef}>
          {!activeUser ? (
            <div className="empty-state">
              Select a user to start chatting
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              No messages yet. Start the conversation.
            </div>
          ) : (
            Object.entries(groupByDate(messages)).map(([date, msgs]) => (
              <div key={date} className="date-group">
                <div className="date-separator">{date}</div>
                {msgs.map((msg, i) => (
                  <div
                    key={i}
                    className={`message ${msg.from === userData.username ? 'sent' : 'received'}`}
                  >
                    <div className="bubble">
                      <div>{msg.text}</div>
                      <div className="timestamp-inline">
                        {(msg.dateTime || msg.createdAt).split(' ').slice(-2).join(' ')}
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
            <div className="input-area">
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
    </div>
  );
}
