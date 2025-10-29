import React, { useEffect, useState } from "react";
import "./../styles/activityLog.css";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3000/activityLog", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setLogs(data.allogs || []);
      })
      .catch((err) => {
        console.error("ActivityLog fetch error:", err);
        setError("Could not load activity logs.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Added [] so it runs once

  const formatDate = (d) => {
    try {
      const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
      if (Number.isNaN(date.getTime())) return String(d);
      return date.toLocaleString();
    } catch {
      return String(d);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div className="container" style={{ flex: 1, overflow: "hidden" }}>
        <div className="header">
          <h1>📋 Activity Log</h1>
        </div>

        {loading ? (
          <div className="loading-box">Loading activity logs...</div>
        ) : error ? (
          <div className="error-box">{error}</div>
        ) : logs && logs.length > 0 ? (
          <>
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-label">Total Activities:</span>
                <span className="stat-value">{logs.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Latest:</span>
                <span className="stat-value time-cell">
                  {formatDate(logs[0].createdAt)}
                </span>
              </div>
            </div>

            {/* ✅ Scrollable table container */}
            <div
              className="table-wrapper"
              style={{
                marginTop: 16,
                flex: 1,
                overflowY: "auto",
                maxHeight: "70vh",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>#</th>
                      <th>Activity</th>
                      <th style={{ width: 180 }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody id="messageBody">
                    {logs.map((log, idx) => (
                      <tr key={log._id || idx}>
                        <td className="id-cell">{idx + 1}</td>
                        <td className="message-cell">
                          {String(log.message || log.msg || "")}
                        </td>
                        <td className="time-cell">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="table-wrapper">
            <div className="no-data">
              <div className="no-data-icon">📝</div>
              <div className="no-data-text">No activity logs found</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
