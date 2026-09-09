import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, ScanEye, UsersRound } from "lucide-react";
import background from "../assets/images/drishti-landing-background.png";
import logo from "../assets/images/drishti-logo.png";
import BackToHome from "../components/layout/BackToHome";
import AuthPanel from "../components/auth/AuthPanel";
import "../styles/auth.css";

const initial = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  remember: false,
};
const leftFeatures = [
  { icon: BrainCircuit, title: "Advanced AI", text: "High Accuracy Screening" },
  { icon: ScanEye, title: "Early Detection", text: "Prevent Vision Loss" },
  { icon: UsersRound, title: "Accessible Care", text: "For Every Community" },
];
export default function LoginPage() {
  const [mode, setMode] = useState("login"),
    [values, setValues] = useState(initial),
    [errors, setErrors] = useState({}),
    [loading, setLoading] = useState(false),
    [notice, setNotice] = useState("");
  const onChange = (e) => {
    const { name, value, checked, type } = e.target;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };
  const validate = () => {
    const next = {};
    if (mode === "signup" && !values.name.trim())
      next.name = "Please enter your full name.";
    if (!values.email.trim()) next.email = "Email address is required.";
    else if (!/^\S+@\S+\.\S+$/.test(values.email))
      next.email = "Enter a valid email address.";
    if (!values.password) next.password = "Password is required.";
    else if (values.password.length < 8)
      next.password = "Use at least 8 characters.";
    if (mode === "signup" && values.confirmPassword !== values.password)
      next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return !Object.keys(next).length;
  };
  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setNotice("");
    setTimeout(() => {
      setLoading(false);
      setNotice(
        mode === "login"
          ? "Login ready — authentication will be connected next."
          : "Account setup ready — authentication will be connected next.",
      );
    }, 800);
  };
  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setNotice("");
    setValues(initial);
  };
  const form = { values, errors, onChange, onSubmit, loading, setNotice };
  return (
    <main className="auth-page">
      <div className="auth-artwork" aria-hidden="true">
        <img src={background} alt="" />
      </div>
      <div className="auth-atmosphere" />
      <div className="auth-content">
        <motion.img
          className="auth-logo"
          src={logo}
          alt="Drishti AI — For Clearer Tomorrows"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <BackToHome />
        <motion.section
          className="auth-intro"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
        >
          <p className="auth-kicker">AI-POWERED RETINAL SCREENING</p>
          <h2>
            See Today
            <br />
            for a Brighter
            <br />
            <em>Tomorrow.</em>
          </h2>
          <span>
            AI-enabled early detection for a healthier,
            <br />
            more inclusive tomorrow.
          </span>
          <div className="auth-feature-list">
            {leftFeatures.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon size={20} />
                <div>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </div>
              </article>
            ))}
          </div>
        </motion.section>
        <AuthPanel mode={mode} setMode={switchMode} form={form} />
        {notice && (
          <motion.p
            className="auth-notice"
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {notice}
          </motion.p>
        )}
      </div>
    </main>
  );
}
