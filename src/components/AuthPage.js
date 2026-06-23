import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/auth";
import SiteLogo from "./SiteLogo";
import "./AuthPage.css";

function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isRegister && !accepted) {
      setError("Please accept the terms before creating your account.");
      return;
    }

    try {
      if (isRegister) {
        registerUser(form);
      } else {
        loginUser(form);
      }

      navigate("/Movies");
    } catch (authError) {
      setError(authError.message);
    }
  }

  return (
    <div className={isRegister ? "auth-page register-page" : "auth-page login-page"}>
      <header className="auth-header">
        <Link to="/" className="auth-brand">
          <SiteLogo />
        </Link>
        <nav className="auth-nav">
          <Link to="/">Home</Link>
          <Link to="/Movies">Movies</Link>
          <Link to="/Movies">Series</Link>
        </nav>
        <Link to={isRegister ? "/Login" : "/Register"} className="auth-top-link">
          {isRegister ? "Sign In" : "Sign Up"}
        </Link>
      </header>

      <main className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>{isRegister ? "Create Your Account" : "Sign In"}</h1>
          <p>
            {isRegister
              ? "Join CineStream and start your immersive journey today."
              : "Welcome back to the future of cinema."}
          </p>

          {isRegister && (
            <label className="auth-field">
              <span>Full Name</span>
              <div className="auth-input-wrap">
                <span aria-hidden="true">♙</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="John Doe"
                  required
                />
              </div>
            </label>
          )}

          <label className="auth-field">
            <span>Email Address</span>
            <div className="auth-input-wrap">
              <span aria-hidden="true">✉</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder="name@example.com"
                required
              />
            </div>
          </label>

          <label className="auth-field">
            <span>
              Password
              {!isRegister && <Link to="/Login">Forgot Password?</Link>}
            </span>
            <div className="auth-input-wrap">
              <span aria-hidden="true">▣</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label="Toggle password visibility"
              >
                ◉
              </button>
            </div>
          </label>

          {isRegister && (
            <label className="terms-row">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <span>
                I agree to the <Link to="/Register">Terms of Use</Link> and{" "}
                <Link to="/Register">Privacy Policy</Link>.
              </span>
            </label>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit">
            {isRegister ? "Start Your Membership" : "Sign In"}
          </button>

          {!isRegister && (
            <>
              <div className="auth-divider"><span>OR</span></div>
              <div className="social-row">
                <button type="button">G</button>
                <button type="button">▦</button>
              </div>
            </>
          )}

          <div className="auth-switch">
            {isRegister ? "Already have an account?" : "New to CineStream?"}{" "}
            <Link to={isRegister ? "/Login" : "/Register"}>
              {isRegister ? "Sign in" : "Sign up now"}
            </Link>
          </div>
        </form>
      </main>

      <footer className="auth-footer">
        <span>© 2024 CineStream. All rights reserved.</span>
        <nav>
          <Link to="/">Help Center</Link>
          <Link to="/">Terms of Use</Link>
          <Link to="/">Privacy</Link>
          <Link to="/">Cookie Preferences</Link>
        </nav>
      </footer>
    </div>
  );
}

export default AuthPage;
