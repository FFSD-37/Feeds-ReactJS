import React, { useState, useEffect } from "react";
import { useUserData } from "./../providers/userData.jsx";
import "./../styles/connect.css";

const Connect = ({ type = "People" }) => {
  const { userData } = useUserData();

  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // 🔹 Verify current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/verify`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setCurrentUser(data?.data?.[0] || null);
      } catch (error) {
        console.error("Error verifying user:", error);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Fetch mutual followers
  useEffect(() => {
    const fetchConnect = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/connect`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        // assume backend returns users and also whether current user already follows them
        setUsers(data.users || []);
        setFilteredUsers(data.users || []);
      } catch (err) {
        console.error("Error fetching mutual followers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConnect();
  }, []);

  // 🔹 Handle search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.trim() === "") {
        setFilteredUsers(users);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/search/${searchTerm.toLowerCase()}`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        setFilteredUsers(data.users || []);
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, users]);

  // 🔹 Follow / Unfollow user
  const handleFollowToggle = async (username, isFollowing) => {
    try {
      const endpoint = isFollowing
        ? `${import.meta.env.VITE_SERVER_URL}/unfollow/${username}`
        : `${import.meta.env.VITE_SERVER_URL}/follow/${username}`;

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Request failed");

      // Update local state instantly
      setFilteredUsers((prev) =>
        prev.map((user) =>
          user.username === username
            ? { ...user, isFollowing: !isFollowing }
            : user
        )
      );
    } catch (error) {
      console.error("Follow/unfollow error:", error);
    }
  };

  return (
    <div className="connect-body min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 px-4 sm:px-8 md:px-16 lg:px-32 py-8 font-inter">
      <div className="connect-content max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="connect-header">
          <h1 className="connect-title">
            {type === "Kids" ? "🔍 Discover New Channels" : "🔍 Discover People"}
          </h1>
          <p className="connect-subtitle">
            {type === "Kids"
              ? "Connect, Learn and Grow together"
              : "Mutual connections based on who your followings follow"}
          </p>
        </div>

        {/* SEARCH BOX */}
        <div className="connect-search-container">
          <div className="connect-search-wrapper relative max-w-xl mx-auto">
            <span className="connect-search-icon absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              🔎
            </span>
            <input
              type="text"
              className="connect-search-input"
              placeholder={
                type === "Kids"
                  ? "Search by channel name..."
                  : "Search by name or username..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* RESULTS */}
        <div className="connect-container">
          {loading ? (
            <div className="connect-empty-state">
              <div className="connect-empty-state-icon animate-spin">⏳</div>
              <div className="connect-empty-state-text">Loading...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="connect-empty-state">
              <div className="connect-empty-state-icon">👥</div>
              <div className="connect-empty-state-text">No results found</div>
            </div>
          ) : (
            <>
              <div className="connect-results-header">
                <span className="connect-results-count text-indigo-600 font-bold">
                  {filteredUsers.length}
                </span>{" "}
                {type === "Kids" ? "Channels" : "People"} Found
              </div>

              <ul id="connect-peopleList" className="connect-people-list grid gap-4">
                {filteredUsers.map((user, index) => (
                  <li key={index} className="connect-list-item flex items-center justify-between">
                    <div className="connect-profile flex items-center gap-4">
                      <img
                        src={user.avatarUrl || user.channelLogo}
                        alt={user.display_name || user.channelName}
                        className="connect-profile-img"
                      />
                      <div className="connect-info">
                        <a
                          href={`/profile/${user.username || user.channelName}`}
                          className="connect-profile-link"
                        >
                          <div className="connect-profile-name">
                            {user.display_name || user.channelName}
                          </div>
                          <div className="connect-profile-username text-gray-500">
                            @{user.username || user.channelName}
                          </div>
                        </a>
                        <div className="connect-stats flex gap-4 text-sm mt-1">
                          {type === "Kids" ? (
                            <div className="connect-stat-item">
                              <span className="connect-stat-icon">➕</span>
                              <span className="connect-stat-value">
                                {user.channelMembers?.length || 0}
                              </span>{" "}
                              Members
                            </div>
                          ) : (
                            <>
                              <div className="connect-stat-item">
                                <span className="connect-stat-icon">👥</span>
                                <span className="connect-stat-value">
                                  {user.followers || 0}
                                </span>{" "}
                                Followers
                              </div>
                              <div className="connect-stat-item">
                                <span className="connect-stat-icon">➕</span>
                                <span className="connect-stat-value">
                                  {user.following || 0}
                                </span>{" "}
                                Following
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 🔹 Follow Button */}
                    {type !== "Kids" && currentUser !== user.username && (
                      <button
                        className={`connect-follow-btn px-4 py-2 rounded-lg font-semibold transition ${
                          user.isFollowing
                            ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                        onClick={() =>
                          handleFollowToggle(user.username, user.isFollowing)
                        }
                      >
                        {user.isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connect;
