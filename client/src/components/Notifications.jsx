import React, { useEffect, useState } from 'react';
import '../styles/notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/GetAllNotifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data.allNotifications || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const followBack = async (username, index) => {
    const updated = [...notifications];
    updated[index].isFollowingBack = true;
    setNotifications(updated);

    try {
      const res = await fetch(`/followback/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      await res.json();

      // Optional: auto-hide the notification
      setTimeout(() => {
        setNotifications(prev => prev.filter((_, i) => i !== index));
      }, 1500);
    } catch (error) {
      console.error(error);
      alert('Failed to follow. Please try again.');
      updated[index].isFollowingBack = false;
      setNotifications(updated);
    }
  };

  const getNotificationDetails = noti => {
    let icon = '📩';
    let message = '';

    switch (noti.msgSerial) {
      case 1:
        icon = '👤';
        message = (
          <>
            <a href={`/profile/${noti.userInvolved}`}>{noti.userInvolved}</a>{' '}
            started following you.
          </>
        );
        break;
      case 2:
        icon = '❤️';
        message = (
          <>
            <a href={`/profile/${noti.userInvolved}`}>{noti.userInvolved}</a>{' '}
            liked your comment.
          </>
        );
        break;
      case 3:
        icon = '👍';
        message = (
          <>
            <a href={`/profile/${noti.userInvolved}`}>{noti.userInvolved}</a>{' '}
            liked your post.
          </>
        );
        break;
      case 4:
        icon = '🤝';
        message = (
          <>
            <a href={`/profile/${noti.userInvolved}`}>{noti.userInvolved}</a>{' '}
            requested to follow you.
          </>
        );
        break;
      case 5:
        icon = '👁️';
        message = (
          <>
            <a href={`/profile/${noti.userInvolved}`}>{noti.userInvolved}</a>{' '}
            has viewed your profile.
          </>
        );
        break;
      case 6:
        icon = '🪙';
        message = (
          <>
            You've received{' '}
            <span className="coin-badge">🪙 {noti.coin} coins</span>
          </>
        );
        break;
      case 7:
        icon = '👋';
        message = (
          <>
            <a href={`/profile/${noti.userInvolved}`}>{noti.userInvolved}</a>{' '}
            has unfollowed you.
          </>
        );
        break;
      case 8:
        icon = '💬';
        message = (
          <>
            <a href={`/profile/${noti.userInvolved}`}>{noti.userInvolved}</a>{' '}
            commented on your post.
          </>
        );
        break;
      case 9:
        icon = '❤️';
        message = (
          <>
            <a href={`/profile/${noti.userInvolved}`}>{noti.userInvolved}</a>{' '}
            liked your comment.
          </>
        );
        break;
      default:
        break;
    }

    return { icon, message };
  };

  return (
    <div className="container">
      <div className="header">
        <span className="header-icon">🔔</span>
        <h1>Notifications</h1>
        {notifications.length > 0 && (
          <span className="header-badge">Total: {notifications.length}</span>
        )}
      </div>

      <div className="notifications-wrapper">
        {loading ? (
          <div className="no-data">
            <div className="no-data-icon">⏳</div>
            <h2>Loading notifications...</h2>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((noti, index) => {
            const { icon, message } = getNotificationDetails(noti);
            const date = new Date(noti.createdAt);

            return (
              <div className="notification-item" key={noti._id || index}>
                <div className="notification-icon">{icon}</div>
                <div className="notification-content">
                  <div className="notification-message">{message}</div>
                  <div className="notification-time">
                    <span>📅</span>
                    {date.toLocaleDateString()} <span>•</span> <span>🕐</span>
                    {date.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {noti.msgSerial === 4 && (
                  <div className="notification-action">
                    <button
                      className={`btn-follow ${
                        noti.isFollowingBack ? 'followed' : ''
                      }`}
                      disabled={noti.isFollowingBack}
                      onClick={() => followBack(noti.userInvolved, index)}
                    >
                      {noti.isFollowingBack ? 'Following ✓' : 'Follow back'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-data">
            <div className="no-data-icon">🔔</div>
            <h2>No notifications yet</h2>
            <p>When you get notifications, they'll show up here</p>
          </div>
        )}
      </div>
    </div>
  );
}
