import { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/pages.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState("today");
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (selectedRange = range) => {
    try {
      setLoading(true);

      let url = `/dashboard/stats?range=${selectedRange}`;

      if (selectedRange === "custom") {
        url = `/dashboard/stats?startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
      }

      const response = await API.get(url);
      setStats(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="page-container"><div className="loading">Loading statistics...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <>
          {/* 🔹 STATS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏨</div>
              <div>
                <h4>Total Rooms</h4>
                <h2>{stats.totalRooms}</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div>
                <h4>Available</h4>
                <h2>{stats.availableRooms}</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔒</div>
              <div>
                <h4>Booked</h4>
                <h2>{stats.bookedRooms}</h2>
              </div>
            </div>
          </div>

          {/* 🔥 REVENUE SECTION */}
          <div className="revenue-section">
            {/* FILTER TABS */}
            <div className="tabs">
              {["today", "week", "month", "custom"].map((item) => (
                <button
                  key={item}
                  className={range === item ? "tab active" : "tab"}
                  onClick={() => {
                    setRange(item);
                    if (item !== "custom") fetchStats(item);
                  }}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>

            {/* CUSTOM DATE */}
            {range === "custom" && (
              <div className="date-picker">
                <input
                  type="date"
                  value={customDates.startDate}
                  onChange={(e) =>
                    setCustomDates({
                      ...customDates,
                      startDate: e.target.value,
                    })
                  }
                />

                <input
                  type="date"
                  value={customDates.endDate}
                  onChange={(e) =>
                    setCustomDates({
                      ...customDates,
                      endDate: e.target.value,
                    })
                  }
                />
                <button onClick={() => fetchStats("custom")}>Apply</button>
              </div>
            )}

            {/* 💰 REVENUE CARD */}
            <div className="revenue-card">
              <h3>Total Revenue</h3>
              <h1>
                ₹{Number(stats.totalRevenue || 0).toLocaleString("en-IN")}
              </h1>
              <p>{range.toUpperCase()} earnings</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
