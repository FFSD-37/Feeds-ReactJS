import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import 'emoji-picker-element';
import '../styles/chat.css';
import { useUserData } from '../providers/userData';

export default function ChatPage() {
  const { userData } = useUserData();

  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [themeDark, setThemeDark] = useState(false);
  const [input, setInput] = useState('');
  const [friends, setFriends] = useState([]);

  const chatBoxRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const socket = useRef(null);

  const scrollBottom = useCallback(() => {
    const el = chatBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
    });

    socket.current.on('receiveMessage', msg => {
      if (msg.from === activeUser) {
        setMessages(prev => [...prev, msg]);
        scrollBottom();
      }
    });

    return () => socket.current.disconnect();
  }, [activeUser, scrollBottom]);

  // Load friend list only once
  useEffect(() => {
    async function loadFriends() {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/friends`, {
          credentials: 'include',
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
        `${import.meta.env.VITE_API_URL}/chat/${username}`,
        {
          credentials: 'include',
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

    socket.current.emit('sendMessage', {
      to: activeUser,
      text: input,
      time,
    });

    setMessages(prev => [...prev, newMsg]);
    setInput('');
    scrollBottom();
  };

  // Emoji picker binding
  useEffect(() => {
    if (!emojiPickerRef.current) return;

    const picker = emojiPickerRef.current;
    const onEmojiClick = e => setInput(prev => prev + e.detail.unicode);

    picker.addEventListener('emoji-click', onEmojiClick);

    return () => picker.removeEventListener('emoji-click', onEmojiClick);
  }, []);

  return (
    <div
      className={themeDark ? 'dark' : ''}
      style={{ display: 'flex', height: '100vh' }}
    >
      {/* Sidebar */}
      <div className={`chatList ${themeDark ? 'dark' : ''}`}>
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
              style={{ textAlign: 'center', marginTop: '50px', opacity: 0.5 }}
            >
              Select a user to start chatting
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{ textAlign: 'center', marginTop: '50px', opacity: 0.5 }}
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

              <button
                onClick={() => {
                  const picker = emojiPickerRef.current;
                  picker.style.display =
                    picker.style.display === 'none' ? 'block' : 'none';
                }}
              >
                😊
              </button>

              <button onClick={sendMessage}>Send</button>
            </div>

            <emoji-picker
              ref={emojiPickerRef}
              style={{
                position: 'absolute',
                bottom: '60px',
                right: '100px',
                display: 'none',
              }}
            />
          </div>
        )}
      </div>

      <button
        className="toggle-dark"
        onClick={() => setThemeDark(prev => !prev)}
        style={{ position: 'absolute', top: 10, right: 10 }}
      >
        🌙
      </button>
    </div>
  );
}
