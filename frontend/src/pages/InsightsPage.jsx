import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  ClipboardList,
  Eye,
  FileText,
  Lightbulb,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { DoctorHeader, DoctorSidebar } from "./DashboardPage";
import fundusImage from "../assets/images/Fundus-image.png";
import "../styles/insights.css";

const education = [
  {
    quote:
      "Early detection and timely referral can help protect vision in people at risk of diabetic retinopathy.",
    text: "This general educational guidance supports regular retinal screening and clinical follow-up. It is not a patient-specific finding.",
  },
  {
    quote:
      "Clear retinal images help clinicians make better informed screening decisions.",
    text: "Image quality checks and clinical context remain essential parts of an AI-assisted screening workflow.",
  },
];
const categories = [
  {
    title: "Screening Tips",
    text: "General guidance for preparing clear retinal images.",
    icon: Eye,
    tone: "green",
  },
  {
    title: "DR Knowledge",
    text: "Educational information about diabetic retinopathy screening.",
    icon: BrainCircuit,
    tone: "orange",
  },
  {
    title: "Clinical Guidelines",
    text: "Screening principles and referral workflow resources.",
    icon: BarChart3,
    tone: "blue",
  },
  {
    title: "Model Insights",
    text: "How explainable AI can support—not replace—clinical judgement.",
    icon: BookOpen,
    tone: "purple",
  },
];
const riskTone = (value) => String(value || "").toLowerCase();

function InsightStat({ icon: Icon, tone, value, label }) {
  return (
    <article className={`insight-stat ${tone}`}>
      <span>
        <Icon size={24} />
      </span>
      <div>
        <strong>{value ?? "—"}</strong>
        <p>{label}</p>
        <small>
          {value == null ? "No data yet" : "From completed analyses"}
        </small>
      </div>
    </article>
  );
}

export default function InsightsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false),
    [loggingOut, setLoggingOut] = useState(false),
    [reports, setReports] = useState([]),
    [insightIndex, setInsightIndex] = useState(0);
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
    let active = true;
    const load = async () => {
      if (!supabase || !user?.id) return;
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: true });
      if (active && !error) setReports(data || []);
    };
    load();
    return () => {
      active = false;
    };
  }, [user?.id]);
  useEffect(() => {
    const timer = window.setInterval(
      () => setInsightIndex((value) => (value + 1) % education.length),
      7000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const risks = useMemo(
    () => ({
      normal: reports.filter(
        (item) => riskTone(item.risk_level || item.risk) === "normal",
      ).length,
      mild: reports.filter(
        (item) => riskTone(item.risk_level || item.risk) === "mild",
      ).length,
      high: reports.filter(
        (item) => riskTone(item.risk_level || item.risk) === "high",
      ).length,
    }),
    [reports],
  );
  const hasRiskData = risks.normal + risks.mild + risks.high > 0;
  const logout = async () => {
    setLoggingOut(true);
    await supabase?.auth.signOut();
    navigate("/login", { replace: true });
  };
  return (
    <main className="doctor-dashboard insights-page">
      <DoctorSidebar
        activePath="/insights"
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
            className="insights-hero"
            initial={{ opacity: 0, y: 13 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p>AI INSIGHTS</p>
              <h1>AI Insights</h1>
              <span>
                Educational and data-driven insights to support your clinical
                practice.
              </span>
            </div>
            <aside>
              <Eye size={27} />
              <strong>
                Smarter Insights.
                <br />
                Better Patient Care.
              </strong>
            </aside>
          </motion.section>
          <section className="insight-stats">
            {[
              {
                icon: BrainCircuit,
                tone: "mint",
                value: reports.length || null,
                label: "Images Analyzed",
              },
              {
                icon: Sparkles,
                tone: "orange",
                value: null,
                label: "Key Insights",
              },
              {
                icon: UsersRound,
                tone: "blue",
                value: null,
                label: "Common Findings",
              },
              {
                icon: ClipboardList,
                tone: "violet",
                value: null,
                label: "Clinical Recommendations",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
              >
                <InsightStat {...stat} />
              </motion.div>
            ))}
          </section>
          <section className="insights-main">
            <motion.section
              className="dashboard-card key-insight"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <header>
                <span>
                  <Lightbulb size={23} />
                </span>
                <h2>Key Insight of the Day</h2>
              </header>
              <AnimatePresence mode="wait">
                <motion.div
                  key={insightIndex}
                  className="educational-insight"
                  initial={{ opacity: 0, x: 9 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -9 }}
                >
                  <p>GENERAL EDUCATIONAL CONTENT</p>
                  <blockquote>“{education[insightIndex].quote}”</blockquote>
                  <span>{education[insightIndex].text}</span>
                </motion.div>
              </AnimatePresence>
              <div className="insight-image">
                <img src={fundusImage} alt="Educational fundus image example" />
                <span>
                  <BarChart3 size={32} />
                </span>
              </div>
              <div className="insight-dots">
                {education.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Show insight ${index + 1}`}
                    className={index === insightIndex ? "active" : ""}
                    onClick={() => setInsightIndex(index)}
                  />
                ))}
              </div>
            </motion.section>
            <section className="dashboard-card trends-card">
              <header>
                <h2>
                  <BarChart3 size={21} />
                  Analysis Trends
                </h2>
                <button>View More →</button>
              </header>
              {reports.length >= 2 ? (
                <div className="trend-placeholder">
                  <BarChart3 size={34} />
                  <strong>
                    Trend visualization is ready for connected report history.
                  </strong>
                  <span>
                    Historical rendering will use completed analysis dates only.
                  </span>
                </div>
              ) : (
                <div className="trend-placeholder">
                  <BarChart3 size={35} />
                  <strong>Not enough data yet</strong>
                  <span>
                    Analysis trends will appear as more screenings are
                    completed.
                  </span>
                </div>
              )}
              <div className="risk-summary">
                {[
                  { label: "Normal", value: risks.normal, tone: "normal" },
                  { label: "Mild Risk", value: risks.mild, tone: "mild" },
                  { label: "High Risk", value: risks.high, tone: "high" },
                ].map((item) => (
                  <article className={item.tone} key={item.label}>
                    <span>{item.label}</span>
                    <strong>{hasRiskData ? item.value : "—"}</strong>
                    <small>
                      {hasRiskData ? "Completed analyses" : "No data yet"}
                    </small>
                  </article>
                ))}
              </div>
            </section>
          </section>
          <section className="dashboard-card categories-card">
            <header>
              <h2>
                <Sparkles size={19} />
                Insights by Category
              </h2>
              <button>View All →</button>
            </header>
            <div>
              {categories.map(({ title, text, icon: Icon, tone }, index) => (
                <motion.article
                  className={tone}
                  key={title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <span>
                    <Icon size={31} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <button>Read More →</button>
                </motion.article>
              ))}
            </div>
          </section>
          <section className="insights-footer">
            <span>
              <FileText size={25} />
            </span>
            <blockquote>
              “Knowledge today, clearer tomorrows.” <i>— Drishti AI</i>
            </blockquote>
            <aside>
              <Sparkles size={27} />
              <strong>
                AI for a Healthier India.
                <br />
                Stronger Communities.
              </strong>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}
