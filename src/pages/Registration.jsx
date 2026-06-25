import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";
import {
  IconCap, IconChevronLeft, IconSmartphone, IconMail, IconCalendar, 
  IconLock, IconEyeOff, IconEye, IconUser, IconArrowRight, IconCheckCircle,
  IconCheckBig, IconUserPlus, IconShield, IconInfo, IconSend
} from "../components/auth/AuthIcons";
import axios from "axios";
import { toast } from "react-toastify";

/* ── Step Header ── */
function RegistrationHeader({ step }) {
  const stepLabels = ["Mobile", "Personal", "Security"];
  return (
    <div className="auth-topbar--dark">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div className="auth-brand__icon" style={{ width: 44, height: 44, borderRadius: 12, margin: 0 }}>
          <IconCap size={24} color="#2952E3" />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0D1B2A' }}>Utkrista Shikshya</div>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>EXCELLENCE IN LEARNING</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#2952E3' }}>Step {step} of 3</span>
        <span className="gender-pill" style={{ padding: '4px 12px', fontSize: 12, width: 'auto', background: '#E0E7FF', color: '#2952E3', border: 'none' }}>
          {stepLabels[step - 1]}
        </span>
      </div>

      <div className="step-progress">
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ flex: 1 }}>
            <div className={`step-progress__bar ${n <= step ? 'filled' : ''}`} style={{ height: 6, margin: 0 }}>
              <div className="step-progress__bar-fill" style={{ width: n < step ? '100%' : n === step ? '100%' : '0%', background: n <= step ? '#2952E3' : '#E2E8F0' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 1: Mobile ── */
function StepMobile({ phone, setPhone, formData, update, onNext }) {
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendOTP = async () => {
  if (phone.length !== 10) {
    setError("Invalid phone number");
    return;
  }

  setError("");

// after adding api this will be undo
   try{
      console.log({
  mobileNo: phone
});
        const res = await axios.post(
            "https://elp.mytufan.com/api/v1/auth/get-phone-number",
            {
                mobileNo: phone
            }
        );

        console.log(res.data);

        toast.success(res.data.message);

        setOtpSent(true);
        

    }
    catch (err) {
      console.log("Full error:", err);
      console.log("Status:", err.response?.status);
      console.log("Response data:", JSON.stringify(err.response?.data, null, 2));
      console.log("Request body:", { phone });

      toast.error(err.response?.data?.message || "Couldn't send OTP");
    }

};

const handleVerifyOTP = () => {
  if (formData.otp.length !== 6) {
    toast.error("Enter a valid 6-digit OTP");
    return;
  }

  toast.success("OTP verified (Frontend Testing)");
  onNext();
};
  return (
    <div className="auth-card" style={{ textAlign: 'center' }}>
      <div className="auth-brand__icon" style={{ borderRadius: 20, width: 72, height: 72, background: '#F0F4FF' }}>
        <IconSmartphone size={32} color="#2952E3" />
      </div>
      <h1 className="auth-card__title" style={{ fontSize: 22 }}>Verify your mobile</h1>
      <p className="auth-card__subtitle">We'll send a code to confirm your identity.</p>
      
      <div className="field" style={{ textAlign: 'left' }}>
        <label className="field__label">Phone Number</label>
        <div className="phone-row">
          <div className="country-select">🇳🇵 +977</div>
          <div className="input-wrap" style={{ flex: 1 }}>
            <input 
              type="tel" 
              placeholder="98XXXXXXXX" 
              value={phone} 
              maxLength={10} 
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} 
            />
          </div>
        </div>
        {error && <p className="field__error">{error}</p>}
      </div>

      <div className="alert alert--info" style={{ background: '#F0F9FF', border: '1px solid #E0F2FE', color: '#0369A1' }}>
        <IconInfo size={16} />
        <span style={{ fontSize: 12 }}>You will receive a 6-digit OTP code shortly.</span>
      </div>

   {/* // opt inpput */}
{otpSent && (
  <div className="field">
    <label className="field__label">Enter OTP</label>

    <div className="input-wrap">
      <input
        type="text"
        placeholder="Enter 6-digit OTP"
        maxLength={6}
        value={formData.otp}
        onChange={(e)=>update("otp", e.target.value)}
        />
    </div>
  </div>
)}

          
    {!otpSent && (
  <button
    className="btn btn-primary btn-full"
    onClick={handleSendOTP}
  >
    Send OTP
  </button>
)}

{otpSent && (
  <button
    className="btn btn-primary btn-full"
    onClick={handleVerifyOTP}
    disabled={verifying}
  >
    {verifying ? "Verifying..." : "Verify OTP"}
  </button>
)}
    </div>
  );
}

/* ── Step 2: Personal ── */
function StepPersonal({ data, update, onNext }) {
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!data.name) e.name = "Required";
    if (!data.email) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Personal Info</h1>
      <p className="auth-card__subtitle">Tell us a bit about yourself so we can personalize your learning experience.</p>
      
      <div className="field__row" style={{ display: 'flex', gap: 12 }}>
        <div className="field" style={{ flex: 1 }}>
          <label className="field__label">Name</label>
          <div className={`input-wrap ${errors.name ? 'input-wrap--error' : ''}`}>
            <input placeholder="Full Name" value={data.name} onChange={e => update('name', e.target.value)} />
          </div>
        <label className="field__label">College Name</label>
        <div className={`input-wrap ${errors.name ? 'input-wrap--error' : ''}`}>
            <input
                placeholder="College Name"
                value={data.collegename}
                onChange={(e)=>update("collegename", e.target.value)}
            />
            </div>
                  <label className="field__label">Faculty</label>
                 
          <select
              value={data.faculty}
              onChange={(e)=>update("faculty", e.target.value)}
          >
              <option value="">Select Faculty</option>
              <option>Class 11 Science</option>
              <option>Class 12 Science</option>
              <option>Management</option>
              <option>BCA</option>
              <option>BSc CSIT</option>
          </select>
          </div>

      </div>

      <div className="field">
        <label className="field__label">Email Address</label>
        <div className={`input-wrap ${errors.email ? 'input-wrap--error' : ''}`}>
          <span className="input-wrap__icon"><IconMail size={16} /></span>
          <input type="email" placeholder="you@example.com" value={data.email} onChange={e => update('email', e.target.value)} />
        </div>
        {errors.email && <p className="field__error">{errors.email}</p>}
      </div>

      <div className="field">
        <label className="field__label">Date of Birth</label>
        <div className="input-wrap">
          <span className="input-wrap__icon"><IconCalendar size={16} /></span>
          <input type="date" value={data.dob} onChange={e => update('dob', e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label className="field__label">Gender Identity</label>
        <div className="gender-row">
          {['Male', 'Female', 'Other'].map(g => (
            <button key={g} type="button" className={`gender-pill ${data.gender === g ? 'gender-pill--active' : ''}`} onClick={() => update('gender', g)}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-full" onClick={() => validate() && onNext()} style={{ padding: 16, borderRadius: 16 }}>
        Continue to Step 3 <IconArrowRight size={18} color="#fff" />
      </button>
    </div>
  );
}

/* ── Step 3: Security ── */
function StepSecurity({ data, update, onNext,phone, formData }) {
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

    const handleSubmit = async () => {
    try {
        // validation
        if (!data.password || !data.confirmPassword) {
        toast.error("Password required");
        return;
        }
        if (data.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
        }

        if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match");
        return;
        }

        if (!data.agreed) {
        toast.error("Please accept terms");
        return;
        }

       const res = await axios.post("https://elp.mytufan.com/api/v1/auth/register",
    {
        name: formData.name,
        email: formData.email,
        password: data.password,
        collegename: formData.collegename,
        faculty: formData.faculty,
        otp: formData.otp,
        userAgent1: navigator.userAgent,
        mobileNo: phone
    }
);

       toast.success(res.data.message || "Account created successfully!");
        onNext();

    } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Registration failed");
    }
    };

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Set Password</h1>
      <p className="auth-card__subtitle">Create a strong password to keep your account safe.</p>

      <div className="field">
        <label className="field__label">Password</label>
        <div className={`input-wrap ${errors.password ? 'input-wrap--error' : ''}`}>
          <span className="input-wrap__icon"><IconLock size={16} /></span>
          <input type={showPw ? "text" : "password"} placeholder="••••••••" value={data.password} onChange={e => update('password', e.target.value)} />
          <button type="button" className="input-wrap__action" onClick={() => setShowPw(!showPw)}>
            {showPw ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        </div>
      </div>

      <div className="field">
        <label className="field__label">Confirm Password</label>
        <div className="input-wrap">
          <span className="input-wrap__icon"><IconShield size={16} /></span>
          <input type={showPw ? "text" : "password"} placeholder="••••••••" value={data.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
        </div>
      </div>

      <div className="checkbox-row" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 24 }}>
        <input type="checkbox" checked={data.agreed} onChange={e => update('agreed', e.target.checked)} id="agreed" style={{ marginTop: 4, accentColor: '#2952E3' }} />
        <label htmlFor="agreed" style={{ fontSize: 13, color: '#64748B', lineHeight: 1.4 }}>
          I agree to the <Link to="/terms" style={{ color: '#2952E3', fontWeight: 700 }}>Terms & Conditions</Link> and Privacy Policy.
        </label>
      </div>

            <button
        className="btn btn-primary btn-full"
        onClick={handleSubmit}
        disabled={
        !data.agreed ||
        !data.password ||
        !data.confirmPassword ||
        data.password !== data.confirmPassword
        }
        style={{ padding: 16, borderRadius: 16 }}
        >
        <IconUserPlus size={18} color="#fff" /> Create Account
        </button>
    </div>
  );
}

/* ── Main Component ── */
export default function Registration() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(1);
  const [phone, setPhone] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    collegename: "",
    faculty: "",
    otp: "",
    password: "",
    confirmPassword: "",
    agreed: false,
    phone: "",
    dob: "",
    gender: "",

});

  const update = (key, val) => setFormData(d => ({ ...d, [key]: val }));

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-topbar">
          <button className="auth-back-btn" onClick={() => stage > 1 ? setStage(stage - 1) : navigate("/login")}>
            <IconChevronLeft color="#0D1B2A" />
          </button>
        </div>

        <RegistrationHeader step={stage} />
        
        {stage === 1 && <StepMobile phone={phone} setPhone={setPhone} formData = {formData} update = {update} onNext={() => setStage(2)} />}
        {stage === 2 && <StepPersonalInfo data={formData} update={update} onNext={() => setStage(3)} />}
        {stage === 3 && <StepSecurity data={formData} update={update} phone={phone} formData={formData} onNext={() => navigate("/login")} />}

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" style={{ color: '#2952E3', fontWeight: 800 }}>Sign In</Link>
        </p>

        <div style={{ textAlign: 'center', marginTop: 40, fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>
          Made with ❤️ Utkrista Shikshya
        </div>
      </div>
    </div>
  );
}

function StepPersonalInfo(props) {
  return <StepPersonal {...props} />;
}
