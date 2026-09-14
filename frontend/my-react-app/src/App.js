import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000"; // Adjust port if needed

export default function App() {
  const [view, setView] = useState("login"); // 'login' | 'register' | 'users'
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Form states (using 'username' to match backend expectation)
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getErrorMessage = (err) => {
    return err.response?.data?.message || err.message || "Something went wrong";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${API_BASE}/login`, {
        email: formData.email,
        password: formData.password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);
      setToken(token);
      setView("users");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API_BASE}/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setSuccess("Account created successfully! Please log in.");
      setView("login");
      setFormData({ username: "", email: "", password: "" });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const fetchUsers = async () => {
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    if (token && view === "users") {
      fetchUsers();
    }
  }, [token, view]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUsers([]);
    setView("login");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>User Auth & Dashboard</h1>
        {token && (
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {view === "login" && !token && (
        <form onSubmit={handleLogin} style={styles.form}>
          <h2>Login</h2>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.btn}>Log In</button>
          <p style={styles.switchText}>
            Don't have an account?{" "}
            <span style={styles.link} onClick={() => { setError(""); setView("register"); }}>
              Register
            </span>
          </p>
        </form>
      )}

      {view === "register" && !token && (
        <form onSubmit={handleRegister} style={styles.form}>
          <h2>Register</h2>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.btn}>Register</button>
          <p style={styles.switchText}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => { setError(""); setView("login"); }}>
              Login
            </span>
          </p>
        </form>
      )}

      {token && (
        <div style={styles.dashboard}>
          <h2>Registered Users</h2>
          {users.length === 0 ? (
            <p>No users found or loading...</p>
          ) : (
            <ul style={styles.userList}>
              {users.map((u) => (
                <li key={u._id} style={styles.userCard}>
                  <strong>{u.username}</strong>
                  <br />
                  <small style={{ color: "#666" }}>{u.email}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}


const styles = {
  container: { maxWidth: "450px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "12px", background: "#f9f9f9", padding: "24px", borderRadius: "8px" },
  input: { padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" },
  btn: { padding: "10px", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  logoutBtn: { padding: "6px 12px", background: "#e53e3e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { color: "red", padding: "8px", background: "#ffebee", borderRadius: "4px", marginBottom: "12px" },
  success: { color: "green", padding: "8px", background: "#e8f5e9", borderRadius: "4px", marginBottom: "12px" },
  switchText: { marginTop: "10px", fontSize: "14px", textAlign: "center" },
  link: { color: "#0070f3", cursor: "pointer", textDecoration: "underline" },
  dashboard: { background: "#f9f9f9", padding: "20px", borderRadius: "8px" },
  userList: { listStyle: "none", padding: 0 },
  userCard: { background: "white", padding: "12px", borderRadius: "4px", marginBottom: "8px", border: "1px solid #eee" }
};