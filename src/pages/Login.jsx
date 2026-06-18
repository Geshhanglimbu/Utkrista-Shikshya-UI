import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";
import { 
  IconCap, IconChevronLeft, IconMail, IconLock, IconEye, IconEyeOff,
  IconAlertTriangle, IconGoogle, IconArrowRight, IconCheckBig, IconAlertCircle
} from "../components/auth/AuthIcons";
import axios from "axios";
import { toast } from "react-toastify";

/* ── Signing In Overlay ── */
function SigningInOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="spinner" />
        <div className="loading-card__title">Signing you in…</div>
        <div className="loading-card__subtitle">Please wait..</div>
      </div>
    </div>
  );
}

/* ── Success Screen ── */
function LoginSuccess({ firstName = "Arjun" }) {
  const [progress, setProgress] = useState(38);
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 2 : 100));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="mini-success-card">
          <div className="mini-success-icon">
            <IconCheckBig size={36} color="#fff" />
          </div>
          <h2 className="mini-success-title" style={{ marginBottom: 12, fontSize: 22 }}>Login Successful!</h2>
          <div className="mini-success-greeting" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span className="mini-success-avatar">{firstName[0]}</span>
            <span>Hello, <strong>{firstName}.</strong> 👋</span>
          </div>
          <p className="mini-success-redirect-text" style={{ fontSize: 13, color: '#64748B' }}>Welcome back! Redirecting to your dashboard…</p>
          <div className="redirect-progress-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, fontSize: 12, fontWeight: 700 }}>
            <span>Redirecting</span>
            <strong>{progress}%</strong>
          </div>
          <div className="redirect-track" style={{ height: 6, background: '#F1F5F9', borderRadius: 10, marginTop: 8, overflow: 'hidden' }}>
            <div className="redirect-fill" style={{ width: `${progress}%`, height: '100%', background: '#2952E3' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Login Page ── */
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [errors, setErrors] = useState({});
  const [showBanner, setShowBanner] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const nextErrs = {};
  if (!email) nextErrs.email = "Email address is required";
  if (!password) nextErrs.password = "Password is required";

  if (Object.keys(nextErrs).length > 0) {
    setErrors(nextErrs);
    setShowBanner(true);
    return;
  }

  try {
    setStatus("loading");

    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    // store token (important)
    localStorage.setItem("token", res.data.token);

    setStatus("success");

    setTimeout(() => {
      navigate("/landingPage");
    }, 1500);

  } catch (error) {
    setStatus("idle");
    setShowBanner(true);

    setErrors({
      api: error.response?.data?.message || "Login failed"
    });
  }
};

  if (status === "success") return <LoginSuccess firstName={email.split('@')[0] || "Student"} />;

  return (
    <div className="auth-page">
      {status === "loading" && <SigningInOverlay />}

      <div className="auth-shell">
        <div className="auth-topbar">
          <button className="auth-back-btn" onClick={() => navigate("/")} aria-label="Go back">
            <IconChevronLeft color="#0D1B2A" />
          </button>
        </div>

        <div className="auth-brand">
          <div className="auth-brand__icon">
            <IconCap size={44} color="#2952E3" />
          </div>
          <h2 className="auth-brand__name">Utkrista Shikshya</h2>
          <p className="auth-brand__tagline">Excellence in Learning</p>
        </div>

        <div className="auth-card">
          {showBanner && (
            <div className="alert alert--error">
              <IconAlertTriangle size={18} color="#B91C1C" />
              <span>Login failed. Please check your credentials.</span>
            </div>
          )}

          <h1 className="auth-card__title">Welcome Back!</h1>
          <p className="auth-card__subtitle">Sign in to continue learning</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="field__label">Email Address</label>
              <div className={`input-wrap ${errors.email ? 'input-wrap--error' : ''}`}>
                <span className="input-wrap__icon"><IconMail size={16} /></span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <span className="input-wrap__action" style={{ paddingRight: 12 }}><IconAlertCircle size={16} /></span>}
              </div>
              {errors.email && <p className="field__error">{errors.email}</p>}
            </div>

            <div className="field">
              <label className="field__label">Password</label>
              <div className={`input-wrap ${errors.password ? 'input-wrap--error' : ''}`}>
                <span className="input-wrap__icon"><IconLock size={16} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="input-wrap__action" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="field__error">{errors.password}</p>}
            </div>

            <div className="field-row-between">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#2952E3' }}
                />
                Remember Me
              </label>
              <Link to="/forgot-password" style={{ color: '#2952E3', fontWeight: 700, fontSize: 13 }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ padding: '16px', borderRadius: '16px', fontSize: '15px' }}>
              Sign In <IconArrowRight size={18} color="#fff" />
            </button>
          </form>

          <div className="divider"><span>OR</span></div>

          <button type="button" className="btn btn-outline btn-full" style={{ padding: '14px', borderRadius: '16px', border: '1.5px solid #E2E8F0', color: '#1E293B' }}>
            <IconGoogle /> Continue with Google
          </button>
        </div>

        <p className="auth-footer-text" style={{ color: '#94A3B8' }}>
          Don't have an account? <Link to="/register" style={{ color: '#2952E3', fontWeight: 800 }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
}
