import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { DoctorHeader, DoctorSidebar } from "./DashboardPage";
import "../styles/settings.css";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
}) {
  return (
    <label className="password-field">
      <span>{label}</span>
      <div>
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={onToggle}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
  );
}

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false),
    [loggingOut, setLoggingOut] = useState(false),
    [form, setForm] = useState({
      fullName: "",
      email: "",
      phone: "",
      specialization: "",
      hospitalClinic: "",
    }),
    [profileMessage, setProfileMessage] = useState(""),
    [profileError, setProfileError] = useState(""),
    [saving, setSaving] = useState(false),
    [passwords, setPasswords] = useState({
      current: "",
      next: "",
      confirm: "",
    }),
    [visible, setVisible] = useState({
      current: false,
      next: false,
      confirm: false,
    }),
    [passwordMessage, setPasswordMessage] = useState(""),
    [passwordError, setPasswordError] = useState(""),
    [updatingPassword, setUpdatingPassword] = useState(false);
  const rawName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Doctor";
  const doctorName = rawName.replace(/^dr\.\s*/i, "");
  const initials = doctorName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  useEffect(() => {
    setForm({
      fullName: profile?.full_name || user?.user_metadata?.full_name || "",
      email: user?.email || profile?.email || "",
      phone: profile?.phone || user?.user_metadata?.phone || "",
      specialization:
        profile?.specialization || user?.user_metadata?.specialization || "",
      hospitalClinic:
        profile?.hospital_clinic || user?.user_metadata?.hospital_clinic || "",
    });
  }, [profile, user]);
  const updateField = (key) => (value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    if (!user || !supabase)
      return setProfileError(
        "Profile updates require a configured Supabase connection.",
      );
    if (!form.fullName.trim()) return setProfileError("Full name is required.");
    if (!form.email.trim())
      return setProfileError("Email address is required.");
    setSaving(true);
    const emailChanged =
      form.email.trim().toLowerCase() !== (user.email || "").toLowerCase();
    if (emailChanged) {
      const { error } = await supabase.auth.updateUser({
        email: form.email.trim(),
      });
      if (error) {
        setSaving(false);
        return setProfileError(error.message);
      }
    }
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          specialization: form.specialization.trim() || null,
          hospital_clinic: form.hospitalClinic.trim() || null,
        },
        { onConflict: "id" },
      );
    setSaving(false);
    if (error) return setProfileError(error.message);
    await refreshProfile?.();
    setProfileMessage(
      emailChanged
        ? "Profile saved. Confirm the email-change message sent by Supabase to complete the new email address."
        : "Profile changes saved.",
    );
  };
  const updatePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");
    if (!passwords.current || !passwords.next || !passwords.confirm)
      return setPasswordError("Complete all password fields.");
    if (passwords.next.length < 8)
      return setPasswordError(
        "New password must contain at least 8 characters.",
      );
    if (passwords.next !== passwords.confirm)
      return setPasswordError("New password and confirmation do not match.");
    if (!supabase)
      return setPasswordError(
        "Password updates require a configured Supabase connection.",
      );
    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: passwords.next,
    });
    setUpdatingPassword(false);
    if (error) return setPasswordError(error.message);
    setPasswords({ current: "", next: "", confirm: "" });
    setPasswordMessage("Password updated. Keep it private and secure.");
  };
  const logout = async () => {
    setLoggingOut(true);
    await supabase?.auth.signOut();
    navigate("/login", { replace: true });
  };
  const accountType = user?.user_metadata?.role || "—";
  const accountStatus = user?.email_confirmed_at ? "Verified" : "—";
  return (
    <main className="doctor-dashboard settings-page">
      <DoctorSidebar
        activePath="/settings"
        open={drawer}
        onClose={() => setDrawer(false)}
        onLogout={logout}
        loggingOut={loggingOut}
        navigate={navigate}
      />
      <div className="dashboard-shell">
        <DoctorHeader
          onOpenNavigation={() => setDrawer(true)}
          doctorName={doctorName}
          initials={initials}
        />
        <div className="dashboard-content">
          <motion.section
            className="settings-hero"
            initial={{ opacity: 0, y: 13 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p>SETTINGS</p>
              <h1>Settings</h1>
              <span>Manage your profile and account settings.</span>
            </div>
            <aside>
              <Settings size={27} />
              <strong>
                Simple Settings.
                <br />A Better Experience.
              </strong>
            </aside>
          </motion.section>
          <section className="settings-layout">
            <motion.form
              className="dashboard-card profile-card"
              onSubmit={saveProfile}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <header>
                <span>
                  <UserRound size={25} />
                </span>
                <div>
                  <h2>Profile Information</h2>
                  <p>Update your personal and professional details.</p>
                </div>
              </header>
              <label>
                Full Name
                <input
                  value={form.fullName}
                  onChange={(event) =>
                    updateField("fullName")(event.target.value)
                  }
                  placeholder="No data yet"
                />
              </label>
              <label>
                Email Address
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email")(event.target.value)}
                  placeholder="No data yet"
                />
              </label>
              <label>
                Phone Number
                <input
                  value={form.phone}
                  onChange={(event) => updateField("phone")(event.target.value)}
                  placeholder="No data yet"
                />
              </label>
              <label>
                Specialization
                <input
                  value={form.specialization}
                  onChange={(event) =>
                    updateField("specialization")(event.target.value)
                  }
                  placeholder="No data yet"
                />
              </label>
              <label>
                Hospital / Clinic
                <input
                  value={form.hospitalClinic}
                  onChange={(event) =>
                    updateField("hospitalClinic")(event.target.value)
                  }
                  placeholder="No data yet"
                />
              </label>
              <AnimatePresence>
                {profileError && (
                  <motion.p
                    className="setting-message error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {profileError}
                  </motion.p>
                )}
                {profileMessage && (
                  <motion.p
                    className="setting-message success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {profileMessage}
                  </motion.p>
                )}
              </AnimatePresence>
              <button className="save-profile" disabled={saving}>
                <Save size={16} />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </motion.form>
            <section className="settings-right">
              <motion.form
                className="dashboard-card password-card"
                onSubmit={updatePassword}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                <header>
                  <span>
                    <LockKeyhole size={25} />
                  </span>
                  <div>
                    <h2>Change Password</h2>
                    <p>Keep your account secure with a new password.</p>
                  </div>
                </header>
                <PasswordField
                  label="Current Password"
                  value={passwords.current}
                  onChange={(value) =>
                    setPasswords((current) => ({ ...current, current: value }))
                  }
                  visible={visible.current}
                  onToggle={() =>
                    setVisible((current) => ({
                      ...current,
                      current: !current.current,
                    }))
                  }
                  placeholder="Enter current password"
                />
                <PasswordField
                  label="New Password"
                  value={passwords.next}
                  onChange={(value) =>
                    setPasswords((current) => ({ ...current, next: value }))
                  }
                  visible={visible.next}
                  onToggle={() =>
                    setVisible((current) => ({
                      ...current,
                      next: !current.next,
                    }))
                  }
                  placeholder="Enter new password"
                />
                <PasswordField
                  label="Confirm New Password"
                  value={passwords.confirm}
                  onChange={(value) =>
                    setPasswords((current) => ({ ...current, confirm: value }))
                  }
                  visible={visible.confirm}
                  onToggle={() =>
                    setVisible((current) => ({
                      ...current,
                      confirm: !current.confirm,
                    }))
                  }
                  placeholder="Confirm new password"
                />
                <AnimatePresence>
                  {passwordError && (
                    <motion.p
                      className="setting-message error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {passwordError}
                    </motion.p>
                  )}
                  {passwordMessage && (
                    <motion.p
                      className="setting-message success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {passwordMessage}
                    </motion.p>
                  )}
                </AnimatePresence>
                <button className="update-password" disabled={updatingPassword}>
                  {updatingPassword ? "Updating…" : "Update Password"}
                </button>
              </motion.form>
              <motion.section
                className="dashboard-card account-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
              >
                <header>
                  <span>
                    <ShieldCheck size={25} />
                  </span>
                  <div>
                    <h2>Account Information</h2>
                    <p>View your account details.</p>
                  </div>
                </header>
                <div className="account-values">
                  <article>
                    <CalendarDays size={22} />
                    <span>
                      Member Since
                      <strong>{formatDate(user?.created_at)}</strong>
                    </span>
                  </article>
                  <article>
                    <UserRound size={22} />
                    <span>
                      Account Type<strong>{accountType}</strong>
                    </span>
                  </article>
                  <article>
                    <ShieldCheck size={22} />
                    <span>
                      Account Status
                      <strong
                        className={
                          accountStatus === "Verified" ? "verified" : ""
                        }
                      >
                        {accountStatus}
                      </strong>
                    </span>
                  </article>
                </div>
              </motion.section>
            </section>
          </section>
          <section className="settings-footer">
            <span>
              <ShieldCheck size={26} />
            </span>
            <div>
              <strong>Secure. Private. Always Yours.</strong>
              <p>
                Your information is protected and used only to enhance your
                experience.
              </p>
            </div>
            <aside>
              <Leaf size={27} />
              <strong>
                Together for
                <br />
                Clearer Tomorrows.
              </strong>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}
