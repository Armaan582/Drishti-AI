import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  BrainCircuit,
  CalendarDays,
  Camera,
  ChevronDown,
  Eye,
  FileCheck2,
  FileText,
  ImageUp,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanEye,
  Search,
  Settings,
  Settings2,
  Sparkles,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import logo from "../assets/images/drishti-logo.png";
import sidebarImage from "../assets/images/sidebar-image.png";
import fundusImage from "../assets/images/Fundus-image.png";
import "../styles/doctor-dashboard.css";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Analyze Image", icon: ScanEye, path: "/analysis" },
  { label: "My Reports", icon: FileText, path: "/reports" },
  { label: "Appointments", icon: CalendarDays, path: "/appointments" },
  { label: "AI Insights", icon: BrainCircuit, path: "/insights" },
];
const insights = [
  "Educational: consistent image quality checks help support reliable retinal screening workflows.",
  "Educational: explainable AI outputs are designed to support—not replace—clinical judgement.",
  "Educational: early screening can help clinicians identify referral needs sooner.",
];

export function DoctorSidebar({
  open,
  onClose,
  onLogout,
  loggingOut,
  navigate,
  activePath = "/dashboard",
}) {
  const item = (entry) => {
    const Icon = entry.icon;
    return (
      <button
        key={entry.label}
        className={entry.path === activePath ? "side-link active" : "side-link"}
        onClick={() => {
          navigate(entry.path);
          onClose();
        }}
      >
        <Icon size={19} />
        {entry.label}
      </button>
    );
  };
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            className="sidebar-scrim"
            aria-label="Close navigation"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <motion.aside
        className={`doctor-sidebar ${open ? "is-open" : ""}`}
        initial={{ x: -18, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="sidebar-top">
          <img src={logo} alt="Drishti AI" />
          <button
            className="mobile-close"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <nav>{navItems.map(item)}</nav>
        <div className="sidebar-bottom">
          <div className="sidebar-divider" />
          <button className="side-link" onClick={() => navigate("/settings")}>
            <Settings size={19} />
            Settings
          </button>
          <button
            className="side-link logout"
            onClick={onLogout}
            disabled={loggingOut}
          >
            <LogOut size={19} />
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
          <img src={sidebarImage} alt="Drishti AI retinal care illustration" />
        </div>
      </motion.aside>
    </>
  );
}

export function DoctorHeader({ onOpenNavigation, doctorName, initials }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null),
    [notifications, setNotifications] = useState([]),
    [logoutError, setLogoutError] = useState(""),
    [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      if (!supabase || !user?.id) return;
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });
      if (active && !error) setNotifications(data || []);
    };
    loadNotifications();
    return () => {
      active = false;
    };
  }, [user?.id]);
  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpenMenu(null);
    };
    const escape = (event) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const unreadCount = notifications.filter(
    (item) => !item.read_at && item.is_read !== true,
  ).length;
  const open = (menu) => {
    setLogoutError("");
    setOpenMenu((current) => (current === menu ? null : menu));
  };
  const selectNotification = async (notification) => {
    if (
      supabase &&
      notification.id &&
      !notification.read_at &&
      notification.is_read !== true
    ) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notification.id);
      if (!error)
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true, read_at: new Date().toISOString() }
              : item,
          ),
        );
    }
    setOpenMenu(null);
  };
  const logout = async () => {
    setLogoutError("");
    setLoggingOut(true);
    const { error } = (await supabase?.auth.signOut()) || {};
    setLoggingOut(false);
    if (error)
      return setLogoutError(
        error.message || "Unable to log out. Please try again.",
      );
    navigate("/login", { replace: true });
  };
  return (
    <header className="dashboard-header">
      <button
        className="header-menu"
        aria-label="Open navigation"
        onClick={onOpenNavigation}
      >
        <Menu size={21} />
      </button>
      <label className="dashboard-search">
        <Search size={18} />
        <input
          placeholder="Search patients, reports, or anything..."
          aria-label="Search patients, reports, or anything"
        />
      </label>
      <div className="header-profile" ref={rootRef}>
        <div className="header-popover-wrap">
          <button
            className="notification"
            aria-label="Notifications"
            aria-expanded={openMenu === "notifications"}
            onClick={() => open("notifications")}
          >
            <Bell size={20} />
            {unreadCount > 0 && <i>{unreadCount > 9 ? "9+" : unreadCount}</i>}
          </button>
          <AnimatePresence>
            {openMenu === "notifications" && (
              <motion.section
                className="header-popover notifications-popover"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <header>
                  <strong>Notifications</strong>
                  {unreadCount > 0 && <span>{unreadCount} unread</span>}
                </header>
                {notifications.length ? (
                  <div>
                    {notifications.map((notification) => (
                      <button
                        className={
                          !notification.read_at && notification.is_read !== true
                            ? "unread"
                            : ""
                        }
                        key={notification.id}
                        onClick={() => selectNotification(notification)}
                      >
                        <strong>{notification.title || "Notification"}</strong>
                        <span>{notification.message || ""}</span>
                        {notification.created_at && (
                          <small>
                            {new Intl.DateTimeFormat("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(notification.created_at))}
                          </small>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="popover-empty">
                    <Bell size={23} />
                    <strong>No new notifications</strong>
                    <span>You’re all caught up.</span>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
        <div className="header-popover-wrap">
          <button
            className="profile-trigger"
            aria-label="Open profile menu"
            aria-expanded={openMenu === "profile"}
            onClick={() => open("profile")}
          >
            <span className="doctor-avatar">{initials}</span>
            <span className="profile-copy">
              <strong>Dr. {doctorName}</strong>
              <small>Ophthalmologist</small>
            </span>
            <ChevronDown size={17} />
          </button>
          <AnimatePresence>
            {openMenu === "profile" && (
              <motion.section
                className="header-popover profile-popover"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <button
                  onClick={() => {
                    setOpenMenu(null);
                    navigate("/settings");
                  }}
                >
                  <Settings size={16} />
                  Settings
                </button>
                <button onClick={logout} disabled={loggingOut}>
                  <LogOut size={16} />
                  {loggingOut ? "Logging out…" : "Logout"}
                </button>
                {logoutError && <p role="alert">{logoutError}</p>}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function AnalyzeCard() {
  const inputRef = useRef(null),
    [file, setFile] = useState(null),
    [dragging, setDragging] = useState(false),
    [message, setMessage] = useState("");
  const choose = (next) => {
    if (!next) return;
    if (!["image/jpeg", "image/png"].includes(next.type)) {
      setMessage("Please choose a JPG or PNG image.");
      return;
    }
    if (next.size > 10 * 1024 * 1024) {
      setMessage("The image must be 10 MB or smaller.");
      return;
    }
    setFile(next);
    setMessage(
      "Image selected. Secure upload and analysis will be enabled when the imaging backend is connected.",
    );
  };
  const openPicker = (event) => {
    event?.stopPropagation();
    inputRef.current?.click();
  };
  const upload = (event) => {
    event.stopPropagation();
    if (!file) return openPicker(event);
    setMessage(
      "Analysis is not available yet. Connect the secure imaging API to enable it.",
    );
  };
  return (
    <section className="dashboard-card analyze-card">
      <div className="card-heading">
        <div>
          <span className="card-icon">
            <ScanEye size={20} />
          </span>
          <h2>Analyze Retinal Image</h2>
          <p>
            Upload a fundus image to get AI-powered analysis and clinical
            insights.
          </p>
        </div>
      </div>
      <div className="analysis-workspace">
        <div
          className={`upload-zone ${dragging ? "dragging" : ""}`}
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            choose(e.dataTransfer.files?.[0]);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => choose(e.target.files?.[0])}
          />
          <ImageUp size={35} />
          <strong>{file ? file.name : "Drag & drop retinal image here"}</strong>
          <span>
            {file
              ? `${Math.ceil(file.size / 1024)} KB selected`
              : "or click to browse"}
          </span>
          <small>Supports: JPG, PNG (Max 10MB)</small>
          <button className="upload-primary" onClick={upload}>
            <Upload size={17} />
            Upload Image
          </button>
        </div>
        <span className="analysis-or">OR</span>
        <aside className="sample-image-card">
          <strong>Sample Image</strong>
          <img src={fundusImage} alt="Example of a normal fundus image" />
          <span>Example of a normal fundus image</span>
        </aside>
      </div>
      {message && (
        <p className="upload-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}

function RecentReports({ navigate, analyses }) {
  return (
    <section className="dashboard-card reports-card">
      <div className="small-card-heading">
        <div>
          <h2>Recent Analyses</h2>
          <p>Completed image analyses</p>
        </div>
        <button className="text-action" onClick={() => navigate("/reports")}>
          View All <ArrowRight size={15} />
        </button>
      </div>
      {analyses.length ? (
        <div className="recent-analysis-list">
          {analyses.map((analysis) => (
            <button key={analysis.id} onClick={() => navigate("/reports")}>
              <FileText size={17} />
              <span>
                <strong>{analysis.original_filename}</strong>
                <small>
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(analysis.created_at))}
                </small>
              </span>
              <i>{analysis.status}</i>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FileText size={28} />
          <strong>No analyses yet</strong>
          <span>Your completed analyses will appear here.</span>
        </div>
      )}
    </section>
  );
}

function Workflow() {
  const steps = [
    {
      title: "Image Upload",
      text: "Retinal fundus image acquisition",
      icon: Camera,
    },
    {
      title: "Preprocessing",
      text: "Image enhancement & quality check",
      icon: Settings2,
    },
    {
      title: "AI Analysis",
      text: "Risk screening & DR grading (0–4)",
      icon: BrainCircuit,
    },
    { title: "Explainable AI", text: "Lesion detection (Grad-CAM)", icon: Eye },
    {
      title: "Report & Recommend",
      text: "Clinical insights & next steps",
      icon: FileCheck2,
    },
  ];
  return (
    <section className="dashboard-card workflow-card">
      <div className="small-card-heading">
        <div>
          <h2>
            <Sparkles size={18} />
            Drishti AI Workflow
          </h2>
        </div>
        <span>
          Learn More <ArrowRight size={15} />
        </span>
      </div>
      <div className="workflow-steps">
        {steps.map(({ title, text, icon: Icon }, index) => (
          <div className="workflow-step" key={title}>
            <span className="workflow-icon">
              <Icon size={22} />
            </span>
            <div>
              <strong>
                {index + 1}. {title}
              </strong>
              <small>{text}</small>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="workflow-arrow" size={18} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Insights({ navigate }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % insights.length),
      5500,
    );
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="dashboard-card insight-card">
      <div className="small-card-heading">
        <div>
          <h2>
            <BrainCircuit size={19} />
            AI Insights
          </h2>
          <p>Educational workflow guidance</p>
        </div>
        <button className="text-action" onClick={() => navigate("/insights")}>
          View More →
        </button>
      </div>
      <div className="insight-message">
        <Sparkles size={24} />
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32 }}
          >
            {insights[index]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="insight-footer">
        <span className="dots">
          {insights.map((_, i) => (
            <i key={i} className={i === index ? "active" : ""} />
          ))}
        </span>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false),
    [loggingOut, setLoggingOut] = useState(false),
    [dashboardData, setDashboardData] = useState({
      analyses: [],
      reportCount: 0,
      appointmentCount: 0,
    });
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
  const logout = async () => {
    setLoggingOut(true);
    await supabase?.auth.signOut();
    navigate("/login", { replace: true });
  };
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!supabase || !user?.id) return;
      const [analysisResult, reportResult, appointmentResult] =
        await Promise.all([
          supabase
            .from("analyses")
            .select("id, original_filename, status, created_at, confidence")
            .eq("doctor_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("reports")
            .select("id", { count: "exact", head: true })
            .eq("doctor_id", user.id),
          supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("doctor_id", user.id),
        ]);
      if (active)
        setDashboardData({
          analyses: analysisResult.data || [],
          reportCount: reportResult.count || 0,
          appointmentCount: appointmentResult.count || 0,
        });
    };
    load();
    return () => {
      active = false;
    };
  }, [user?.id]);
  const confidenceValues = dashboardData.analyses
    .map((item) => Number(item.confidence))
    .filter(Number.isFinite);
  const confidence = confidenceValues.length
    ? `${Math.round(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)}%`
    : null;
  const stats = [
    {
      label: "Images Analyzed",
      icon: ImageUp,
      tone: "mint",
      value: dashboardData.analyses.length || null,
    },
    {
      label: "Reports Generated",
      icon: FileText,
      tone: "peach",
      value: dashboardData.reportCount || null,
    },
    {
      label: "Appointments",
      icon: CalendarDays,
      tone: "blue",
      value: dashboardData.appointmentCount || null,
    },
    {
      label: "Report Confidence",
      icon: Sparkles,
      tone: "violet",
      value: confidence,
    },
  ];
  return (
    <main className="doctor-dashboard">
      <DoctorSidebar
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
            className="welcome"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p>DOCTOR DASHBOARD</p>
              <h1>
                Welcome back, Dr. <em>{doctorName}</em>
              </h1>
              <span>
                Your expertise makes a difference. Let’s detect earlier, prevent
                blindness together.
              </span>
            </div>
            <aside className="welcome-callout">
              <Eye size={27} />
              <strong>
                Early Detection.
                <br />
                Healthier Tomorrows.
              </strong>
            </aside>
          </motion.section>
          <section className="stat-grid">
            {stats.map(({ label, icon: Icon, tone, value }, index) => (
              <motion.article
                key={label}
                className="stat-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index }}
              >
                <span className={`stat-icon ${tone}`}>
                  <Icon size={19} />
                </span>
                <p>{label}</p>
                <strong>{value ?? "—"}</strong>
                <small>
                  {value == null ? "No data yet" : "From your records"}
                </small>
              </motion.article>
            ))}
          </section>
          <section className="dashboard-grid">
            <AnalyzeCard />
            <RecentReports
              navigate={navigate}
              analyses={dashboardData.analyses.slice(0, 5)}
            />
            <Workflow />
            <section className="dashboard-card quick-card">
              <div className="small-card-heading">
                <div>
                  <h2>
                    <Zap size={18} />
                    Quick Actions
                  </h2>
                  <p>Continue your clinical workflow</p>
                </div>
              </div>
              <div className="quick-actions">
                {[
                  { label: "Analyze Image", icon: ScanEye, path: "/analysis" },
                  { label: "View Reports", icon: FileText, path: "/reports" },
                  {
                    label: "Manage Appointments",
                    icon: CalendarDays,
                    path: "/appointments",
                  },
                ].map(({ label, icon: Icon, path }) => (
                  <button key={label} onClick={() => navigate(path)}>
                    <Icon size={18} />
                    {label}
                    <span>→</span>
                  </button>
                ))}
              </div>
            </section>
            <Insights navigate={navigate} />
          </section>
          <motion.aside
            className="dashboard-quote"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            “Early detection saves vision. AI helps you see it sooner.”{" "}
            <span>— Drishti AI</span>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
