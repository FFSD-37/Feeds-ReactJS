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

    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg = {
      text: input,
      from: userData.username,
      time,
    };

    socket.emit('sendMessage', {
      to: activeUser,
      text: input,
      time,
    });

    setMessages(prev => [...prev, newMsg]);
    setInput('');
    scrollBottom();
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
        <div className="messages" ref={chatBoxRef}>
          {!activeUser ? (
            <div
              style={{
                textAlign: 'center',
                marginTop: '50px',
                opacity: 0.5,
                color: 'white',
              }}
            >
              Select a user to start chatting
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                marginTop: '50px',
                opacity: 0.5,
                color: 'white',
              }}
            >
              No messages yet. Start the conversation.
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.from === userData.username ? 'sent' : 'received'}`}
              >
                <div>{msg.text}</div>
                <div className="timestamp">{msg.time || msg.createdAt}</div>
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
