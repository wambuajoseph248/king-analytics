import { useEffect, useState } from "react";
import "./Admin.css";

const API_URL = "https://king-analytics-api.onrender.com";

function Admin() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("kingAdminToken"))
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const login = async (e) => {
    e.preventDefault();

    try {
      setLoggingIn(true);
      setLoginError("");

      const response = await fetch(
        `${API_URL}/api/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      localStorage.setItem(
        "kingAdminToken",
        data.token
      );

      setLoggedIn(true);
      setUsername("");
      setPassword("");
    } catch (err) {
      setLoginError(
        err.message || "Unable to log in."
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("kingAdminToken");
    setLoggedIn(false);
    setBookings([]);
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("kingAdminToken");

      const response = await fetch(
        `${API_URL}/api/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load bookings."
        );
      }

      setBookings(data.bookings || []);
    } catch (err) {
      console.error(
        "ADMIN BOOKINGS ERROR:",
        err
      );

      setError(
        err.message || "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      loadBookings();
    }
  }, [loggedIn]);

  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);

      const token =
        localStorage.getItem("kingAdminToken");

      const response = await fetch(
        `${API_URL}/api/bookings/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to update status."
        );
      }

      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === id
            ? {
                ...booking,
                status,
              }
            : booking
        )
      );
    } catch (err) {
      alert(
        err.message ||
          "Unable to update status."
      );
    } finally {
      setUpdating(null);
    }
  };

  const deleteBooking = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem("kingAdminToken");

      const response = await fetch(
        `${API_URL}/api/bookings/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to delete booking."
        );
      }

      setBookings((previous) =>
        previous.filter(
          (booking) =>
            booking.id !== id
        )
      );
    } catch (err) {
      alert(
        err.message ||
          "Unable to delete booking."
      );
    }
  };

  /* =========================
     LOGIN SCREEN
  ========================= */

  if (!loggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="login-logo">
            <span>K</span>
            KING ANALYTICS
          </div>

          <div className="login-heading">
            <span>ADMINISTRATION</span>
            <h1>Welcome Back</h1>
            <p>
              Sign in to manage your project
              bookings.
            </p>
          </div>

          <form onSubmit={login}>
            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter admin username"
              required
            />

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter admin password"
              required
            />

            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loggingIn}
            >
              {loggingIn
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          <a
            className="back-home"
            href="/"
          >
            ← Back to King Analytics
          </a>
        </div>
      </div>
    );
  }

  /* =========================
     DASHBOARD
  ========================= */

  const pending = bookings.filter(
    (booking) =>
      booking.status === "PENDING"
  ).length;

  const inProgress = bookings.filter(
    (booking) =>
      booking.status === "IN_PROGRESS"
  ).length;

  const completed = bookings.filter(
    (booking) =>
      booking.status === "COMPLETED"
  ).length;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <div className="admin-logo">
            <span>K</span> KING ANALYTICS
          </div>

          <p>
            Administration Dashboard
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            className="refresh-button"
            onClick={loadBookings}
          >
            ↻ Refresh
          </button>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="admin-container">
        <div className="admin-title">
          <span>ADMINISTRATION</span>

          <h1>Project Bookings</h1>

          <p>
            Manage client project requests
            and booking statuses.
          </p>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">
              📋
            </div>

            <div>
              <span>Total Bookings</span>
              <strong>
                {bookings.length}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🕐
            </div>

            <div>
              <span>Pending</span>
              <strong>{pending}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ⚙️
            </div>

            <div>
              <span>In Progress</span>
              <strong>
                {inProgress}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ✅
            </div>

            <div>
              <span>Completed</span>
              <strong>
                {completed}
              </strong>
            </div>
          </div>
        </div>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <section className="bookings-panel">
          <div className="panel-header">
            <div>
              <h2>Client Bookings</h2>

              <p>
                All project requests submitted
                through your website.
              </p>
            </div>

            <span className="booking-count">
              {bookings.length} bookings
            </span>
          </div>

          {loading ? (
            <div className="admin-loading">
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-bookings">
              <div>📭</div>

              <h3>No bookings yet</h3>

              <p>
                Client bookings will appear
                here when someone submits a
                project request.
              </p>
            </div>
          ) : (
            <div className="bookings-table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Service</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map(
                    (booking) => (
                      <tr
                        key={booking.id}
                      >
                        <td>
                          <strong>
                            #{booking.id}
                          </strong>
                        </td>

                        <td>
                          <div className="client-name">
                            {booking.client
                              ?.name ||
                              "Unknown Client"}
                          </div>
                        </td>

                        <td>
                          <div className="contact-info">
                            <span>
                              {booking.client
                                ?.email ||
                                "No email"}
                            </span>

                            <span>
                              {booking.client
                                ?.phone ||
                                "No phone"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="service-badge">
                            {booking.service
                              ?.name ||
                              "Unknown Service"}
                          </span>
                        </td>

                        <td>
                          <div className="description">
                            {booking.description ||
                              "No description"}
                          </div>
                        </td>

                        <td>
                          {booking.createdAt
                            ? new Date(
                                booking.createdAt
                              ).toLocaleString()
                            : "—"}
                        </td>

                        <td>
                          <select
                            className={`status-select ${String(
                              booking.status ||
                                ""
                            ).toLowerCase()}`}
                            value={
                              booking.status
                            }
                            disabled={
                              updating ===
                              booking.id
                            }
                            onChange={(e) =>
                              updateStatus(
                                booking.id,
                                e.target.value
                              )
                            }
                          >
                            <option value="PENDING">
                              Pending
                            </option>

                            <option value="IN_PROGRESS">
                              In Progress
                            </option>

                            <option value="COMPLETED">
                              Completed
                            </option>

                            <option value="CANCELLED">
                              Cancelled
                            </option>
                          </select>
                        </td>

                        <td>
                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteBooking(
                                booking.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="admin-footer">
        © 2026 King Analytics —
        Administration
      </footer>
    </div>
  );
}

export default Admin;