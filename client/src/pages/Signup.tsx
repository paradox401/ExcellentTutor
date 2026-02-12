import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setRole } from "../lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classLevelId, setClassLevelId] = useState("");
  const [classes, setClasses] = useState<{ _id: string; title: string }[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/catalog/classes-summary`);
        const data = await response.json();
        setClasses(data.classes ?? []);
        if (data.classes?.length) {
          setClassLevelId(data.classes[0]._id);
        }
      } catch {
        setClasses([]);
      }
    };
    load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, classLevelId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message ?? "Signup failed");
        return;
      }
      localStorage.setItem("token", data.token);
      setRole(data.user?.role);
      window.dispatchEvent(new Event("storage"));
      setMessage("Account created. You're logged in.");
      navigate("/dashboard");
    } catch (error) {
      setMessage("Something went wrong.");
    }
  };

  return (
    <section className="section auth">
      <div className="auth-shell">
        <div className="auth-card wide">
          <h2>Create your student account</h2>
          <p>Start learning with full access to notes and tutorials.</p>
          <form onSubmit={handleSubmit}>
            <label>
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
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
              Class
              <select value={classLevelId} onChange={(event) => setClassLevelId(event.target.value)}>
                {classes.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title}
                  </option>
                ))}
              </select>
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
              Create account
            </button>
          </form>
          {message && <p className="auth-message">{message}</p>}
        </div>
        <aside className="auth-panel">
          <strong>What you get</strong>
          <ul>
            <li>Notes, videos, and model questions</li>
            <li>Live classes and recordings</li>
            <li>Class-specific content only</li>
          </ul>
          <p className="muted">Already have an account? Login to continue.</p>
        </aside>
      </div>
    </section>
  );
}
