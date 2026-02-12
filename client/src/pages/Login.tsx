import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setRole } from "../lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message ?? "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      setRole(data.user?.role);
      window.dispatchEvent(new Event("storage"));
      setMessage("Logged in successfully.");
      if (data.user?.role === "ADMIN") {
        navigate("/admin-panel");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage("Something went wrong.");
    }
  };

  return (
    <section className="section auth">
      <div className="auth-shell">
        <div className="auth-card wide">
          <h2>Welcome back</h2>
          <p>Log in to access your courses and live sessions.</p>
          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            <button className="primary" type="submit">
              Login
            </button>
          </form>
          {message && <p className="auth-message">{message}</p>}
        </div>
        <aside className="auth-panel">
          <strong>Why students love Excellent Tutor</strong>
          <ul>
            <li>Class-based content and clean structure</li>
            <li>Model questions + live sessions</li>
            <li>Progress tracking and study goals</li>
          </ul>
          <p className="muted">New here? Create a free student account in 2 minutes.</p>
        </aside>
      </div>
    </section>
  );
}
