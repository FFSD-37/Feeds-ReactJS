import React, { useState, useEffect } from 'react';
import { Home, Clock, Settings, MoreHorizontal, Search, ShoppingBag, Bell, MessageSquare, Menu, ChevronDown, File, Inbox, Users, Image, Video, Mail, User, BarChart3, LogOut, Eye, MessageCircle, Heart, Share2, Music, Camera, Film } from 'lucide-react';
import '../styles/Landing.css';
import { useUserData } from '../providers/userData.jsx';
import { useNavigate } from 'react-router-dom';
const WinkuSocial = () => {
  const [activeTab, setActiveTab] = useState('likes');
  const { userData, setUserData } = useUserData();
  const navigate = useNavigate();

  const getFriends = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/home/getFriends`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    console.log(data);
    if (data.success) {
      setFriends(data.friends);
    }
  };

  useEffect(() => {
    getFriends();
  }, []);

  const [friends, setFriends] = useState([]);
  console.log(friends);

  return (
      <div className="main-layout">
        <main className="main-content">
          <div className="content-section">
            {/* Post */}
            <div className="post-card">
              <div className="post-header">
                <img src="https://i.pravatar.cc/150?img=9" alt="Janice" className="post-avatar" />
                <div className="post-author">
                  <h3 className="post-author-name">Janice Griffith</h3>
                  <p className="post-timestamp">Published: June 2, 2018 1:9 PM</p>
                </div>
                <button className="icon-button">
                  <MoreHorizontal style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                </button>
              </div>

              {/* Post Image */}
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=600&fit=crop"
                alt="Post"
                className="post-image"
              />

              {/* Post Stats */}
              <div className="post-stats">
                <div className="post-stat">
                  <Eye style={{ width: '16px', height: '16px' }} />
                  <span>1.2k</span>
                </div>
                <div className="post-stat">
                  <MessageCircle style={{ width: '16px', height: '16px' }} />
                  <span>52</span>
                </div>
                <div className="post-stat">
                  <Heart style={{ width: '16px', height: '16px' }} />
                  <span>2.2k</span>
                </div>
                <div className="post-stat">
                  <span>👍</span>
                  <span>206</span>
                </div>
                <button className="icon-button post-stat-auto">
                  <Share2 style={{ width: '16px', height: '16px' }} />
                </button>
              </div>

              {/* Post Content */}
              <p className="post-text">
                World's most beautiful car in Curabitur <span className="post-hashtag">#test drive booking</span> ! the most beautiful car available in america and the snaijei arabia, you can book your test drive by our official website
              </p>

              {/* Comment */}
              <div className="comment-section">
                <div className="comment">
                  <img src="https://i.pravatar.cc/150?img=10" alt="Jason" className="comment-avatar" />
                  <div className="comment-content">
                    <div className="comment-header">
                      <h4 className="comment-author">Jason Borne</h4>
                      <span className="comment-time">1 year ago</span>
                    </div>
                    <p className="comment-text">Great post! Really inspiring.</p>
                  </div>
                  <button className="icon-button">
                    <Share2 style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          <div className="sidebar-section">
            {/* Your Page */}
            {userData?.type === "Channel" ? (
            <div className="card">
            <h3 className="card-title">Your Page</h3>
            <div className="page-header">
              <img src="https://i.pravatar.cc/150?img=8" alt="My Page" className="page-avatar" />
              <div className="page-info">
                <h4 className="page-name">My Page</h4>
                <div className="page-stats">
                  <span className="page-stat-item">
                    <Mail style={{ width: '12px', height: '12px' }} />
                    <span>Messages</span>
                    <span className="page-badge">9</span>
                  </span>
                </div>
                <div className="page-stats">
                  <Bell style={{ width: '12px', height: '12px' }} />
                  <span>Notifications</span>
                  <span className="page-badge">2</span>
                </div>
              </div>
            </div>

            <div className="tabs">
              <button 
                onClick={() => setActiveTab('likes')}
                className={`tab ${activeTab === 'likes' ? 'active' : 'inactive'}`}
              >
                LIKES
              </button>
              <button 
                onClick={() => setActiveTab('views')}
                className={`tab ${activeTab === 'views' ? 'active' : 'inactive'}`}
              >
                VIEWS
              </button>
            </div>

            <div className="likes-section">
              <div className="likes-count">
                <Heart style={{ width: '24px', height: '24px', color: '#9ca3af' }} />
                <span>884</span>
              </div>
              <p className="likes-new">35 New Likes This Week</p>
              <div className="likes-avatars">
                {friends.map((friend, index) => (
                  <img 
                    key={index}
                    src={friend.avatarUrl} 
                    alt={friend.username}
                    className="likes-avatar"
                    onClick={() => navigate(`/profile/${friend.username}`)}
                  />
                ))}
              </div>
            </div>
          </div>
            ) : null}
          </div>

          <div className="sidebar-section">
            {/* Create Page Card */}
            <div className="create-page-card">
              <div className="create-page-icon">
                <File style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h3 className="create-page-title">CREATE YOUR OWN FAVOURITE PAGE.</h3>
              <p className="create-page-subtitle">like them all</p>
              <button className="create-page-button">Start Now!</button>
            </div>
          </div>

          <div className="sidebar-section">
            {/* Friends */}
            <div className="card">
              <h3 className="card-title">Friends</h3>
              <div className="friends-grid">
                {friends.slice(0, 9).map((friend, index) => (
                  <img 
                    key={index}
                    src={friend.avatarUrl} 
                    alt={friend.username}
                    className="friend-avatar"
                    onClick={() => navigate(`/profile/${friend.username}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
  );
};

export default WinkuSocial;
