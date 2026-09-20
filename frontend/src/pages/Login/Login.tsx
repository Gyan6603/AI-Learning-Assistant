import { useState } from "react";
import { loginUser } from "../../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    try {
      const data = await loginUser(email, password);

      if (data.success) {
        localStorage.setItem("access_token", data.access_token);
        setMessage("Login successful!");
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("Login failed");
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <br />

      <button onClick={handleLogin}>
        Login
      </button>

      <p>{message}</p>
    </div>
  );
}

export default Login;