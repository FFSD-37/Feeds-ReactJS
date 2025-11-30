import React, { useEffect, useState } from "react";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const totalLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/activityLog`,
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await res.json();
      setLogs(data.logs || []);
      setError(null);
    } catch (err) {
      setError("Failed to load activity logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    totalLogs();
  }, []);

  const formatDate = (d) => {
    try {
      const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
      if (Number.isNaN(date.getTime())) return String(d);
      
      const now = new Date();
      const diff = now - date;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return String(d);
    }
  };

  const formatFullDate = (d) => {
    try {
      const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
      if (Number.isNaN(date.getTime())) return String(d);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(d);
    }
  };

  const filteredLogs = logs.filter(log => {
    const message = String(log.message || log.msg || "").toLowerCase();
    return message.includes(searchTerm.toLowerCase());
  });

  const getActivityIcon = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes("login") || msg.includes("signed in")) return "🔐";
    if (msg.includes("logout") || msg.includes("signed out")) return "🚪";
    if (msg.includes("create") || msg.includes("add")) return "➕";
    if (msg.includes("delete") || msg.includes("remove")) return "🗑️";
    if (msg.includes("update") || msg.includes("edit")) return "✏️";
    if (msg.includes("upload")) return "📤";
    if (msg.includes("download")) return "📥";
    if (msg.includes("share")) return "🔗";
    if (msg.includes("comment")) return "💬";
    if (msg.includes("like")) return "❤️";
    return "📋";
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    :root {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --primary-light: #818cf8;
      --success: #10b981;
      --error: #ef4444;
      --warning: #f59e0b;
      --text-primary: #0f172a;
      --text-secondary: #64748b;
      --text-muted: #94a3b8;
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --border: #e2e8f0;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .activity-wrap {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      min-height: 100vh;
    }
    
    .activity-header {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-xl);
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: fadeInDown 0.6s ease-out;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .header-title h1 {
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }
    
    .header-icon {
      font-size: 36px;
    }
    
    .refresh-btn {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .refresh-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }
    
    .refresh-btn:active {
      transform: translateY(0);
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
      animation: fadeIn 0.8s ease-out 0.2s both;
    }
    
    .stat-card {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 24px;
      box-shadow: var(--shadow-lg);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }
    
    .stat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .stat-icon {
      font-size: 28px;
    }
    
    .stat-label {
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
    }
    
    .stat-subtext {
      color: var(--text-muted);
      font-size: 13px;
      margin-top: 4px;
    }
    
    .controls-bar {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-lg);
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: fadeIn 0.8s ease-out 0.3s both;
    }
    
    .search-box {
      position: relative;
      max-width: 400px;
    }
    
    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: var(--text-muted);
    }
    
    .search-input {
      width: 100%;
      padding: 14px 16px 14px 48px;
      border: 2px solid var(--border);
      border-radius: 12px;
      background: var(--bg-secondary);
      font-size: 15px;
      font-weight: 500;
      color: var(--text-primary);
      transition: all 0.2s ease;
    }
    
    .search-input:focus {
      outline: none;
      border-color: var(--primary);
      background: var(--bg-primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .search-input::placeholder {
      color: var(--text-muted);
    }
    
    .table-card {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: fadeInUp 0.8s ease-out 0.4s both;
    }
    
    .table-wrapper {
      overflow-x: auto;
      max-height: 600px;
      overflow-y: auto;
    }
    
    .table-wrapper::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    
    .table-wrapper::-webkit-scrollbar-track {
      background: var(--bg-secondary);
    }
    
    .table-wrapper::-webkit-scrollbar-thumb {
      background: var(--primary);
      border-radius: 10px;
    }
    
    .table-wrapper::-webkit-scrollbar-thumb:hover {
      background: var(--primary-dark);
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    thead {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    th {
      padding: 18px 20px;
      text-align: left;
      color: white;
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td {
      padding: 18px 20px;
      border-bottom: 1px solid var(--border);
      color: var(--text-primary);
      font-size: 15px;
      font-weight: 500;
    }
    
    tbody tr {
      background: white;
      transition: all 0.2s ease;
    }
    
    tbody tr:hover {
      background: var(--bg-secondary);
      transform: scale(1.01);
    }
    
    tbody tr:last-child td {
      border-bottom: none;
    }
    
    .activity-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .activity-icon-cell {
      font-size: 24px;
    }
    
    .activity-content {
      flex: 1;
    }
    
    .activity-message {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    
    .activity-meta {
      font-size: 13px;
      color: var(--text-muted);
    }
    
    .index-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
      color: white;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
    }
    
    .time-badge {
      display: inline-block;
      padding: 6px 12px;
      background: var(--bg-secondary);
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 600;
      white-space: nowrap;
    }
    
    .loading-state {
      text-align: center;
      padding: 80px 20px;
    }
    
    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    .loading-text {
      color: var(--text-secondary);
      font-size: 16px;
      font-weight: 600;
    }
    
    .error-state {
      text-align: center;
      padding: 80px 20px;
    }
    
    .error-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    .error-text {
      color: var(--error);
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    
    .error-subtext {
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }
    
    .empty-icon {
      font-size: 80px;
      opacity: 0.3;
      margin-bottom: 16px;
    }
    
    .empty-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    .empty-text {
      color: var(--text-secondary);
      font-size: 15px;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .activity-wrap {
        padding: 24px 16px;
      }
      
      .activity-header {
        padding: 24px 20px;
      }
      
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .header-title h1 {
        font-size: 24px;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .search-box {
        max-width: 100%;
      }
      
      .table-wrapper {
        max-height: 500px;
      }
      
      th, td {
        padding: 12px 16px;
        font-size: 14px;
      }
      
      .activity-message {
        font-size: 14px;
      }
    }
  `;

  return (
    <div className="activity-wrap">
      <style>{styles}</style>
      
      <div className="activity-header">
        <div className="header-content">
          <div className="header-title">
            <span className="header-icon">📊</span>
            <h1>Activity Log</h1>
          </div>
          <button className="refresh-btn" onClick={totalLogs}>
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {!loading && !error && logs.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">📈</span>
              <span className="stat-label">Total Activities</span>
            </div>
            <div className="stat-value">{logs.length}</div>
            <div className="stat-subtext">All time records</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">🕒</span>
              <span className="stat-label">Latest Activity</span>
            </div>
            <div className="stat-value" style={{ fontSize: '18px' }}>
              {formatDate(logs[0].createdAt)}
            </div>
            <div className="stat-subtext">{formatFullDate(logs[0].createdAt)}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">📅</span>
              <span className="stat-label">Today</span>
            </div>
            <div className="stat-value">
              {logs.filter(log => {
                const logDate = new Date(log.createdAt);
                const today = new Date();
                return logDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <div className="stat-subtext">Activities today</div>
          </div>
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="controls-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading activity logs...</div>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <div className="error-text">{error}</div>
            <div className="error-subtext">Please try refreshing the page</div>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>#</th>
                  <th>Activity</th>
                  <th style={{ width: '180px' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={log._id || idx}>
                    <td>
                      <span className="index-badge">{idx + 1}</span>
                    </td>
                    <td>
                      <div className="activity-row">
                        <span className="activity-icon-cell">
                          {getActivityIcon(String(log.message || log.msg || ""))}
                        </span>
                        <div className="activity-content">
                          <div className="activity-message">
                            {String(log.message || log.msg || "")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="time-badge" title={formatFullDate(log.createdAt)}>
                        {formatDate(log.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : searchTerm ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No results found</div>
            <div className="empty-text">Try searching with different keywords</div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <div className="empty-title">No Activity Logs</div>
            <div className="empty-text">Your activities will appear here once you start using the platform</div>
          </div>
        )}
      </div>
    </div>
  );
}