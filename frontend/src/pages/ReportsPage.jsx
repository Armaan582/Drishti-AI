import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { DoctorHeader, DoctorSidebar } from "./DashboardPage";
import "../styles/reports.css";

const riskTone = (value) =>
  ({ high: "high", moderate: "moderate", mild: "mild", normal: "normal" })[
    String(value || "").toLowerCase()
  ] || "neutral";
const getAnalysis = (report) => report.analyses || {};
const getName = (report) =>
  report.report_name ||
  report.name ||
  report.title ||
  getAnalysis(report).original_filename ||
  "Untitled report";
const getId = (report) => report.report_id || report.id || "";
const getDate = (report) =>
  report.created_at || report.analyzed_at || report.date;
const getRisk = (report) =>
  report.risk_level || report.risk || getAnalysis(report).risk_level;
const getGrade = (report) =>
  report.dr_grade === 0 || report.dr_grade
    ? `Grade ${report.dr_grade}`
    : report.grade ||
      (getAnalysis(report).dr_grade === 0 || getAnalysis(report).dr_grade
        ? `Grade ${getAnalysis(report).dr_grade}`
        : "—");
const getStatus = (report) => report.report_status || report.status || "—";
const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";

function Stat({ icon: Icon, tone, label, value, sub }) {
  return (
    <article className={`report-stat ${tone}`}>
      <span>
        <Icon size={23} />
      </span>
      <div>
        <strong>{value ?? "—"}</strong>
        <p>{label}</p>
        <small>{sub}</small>
      </div>
    </article>
  );
}

export default function ReportsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false),
    [loggingOut, setLoggingOut] = useState(false);
  const [reports, setReports] = useState([]),
    [loading, setLoading] = useState(false),
    [query, setQuery] = useState(""),
    [risk, setRisk] = useState(""),
    [grade, setGrade] = useState(""),
    [date, setDate] = useState(""),
    [selected, setSelected] = useState(null);
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
    let mounted = true;
    const load = async () => {
      if (!supabase || !user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select(
          "*, analyses(original_filename, image_path, risk_level, dr_grade, confidence, status, created_at)",
        )
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });
      if (mounted && !error) setReports(data || []);
      if (mounted) setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);
  const filtered = useMemo(
    () =>
      reports.filter((report) => {
        const haystack =
          `${getName(report)} ${getId(report)} ${report.notes || ""}`.toLowerCase();
        const reportRisk = String(getRisk(report) || "").toLowerCase();
        const reportGrade = String(
          report.dr_grade ?? report.grade ?? "",
        ).toLowerCase();
        const created = getDate(report);
        return (
          (!query || haystack.includes(query.toLowerCase())) &&
          (!risk || reportRisk === risk) &&
          (!grade || reportGrade === grade) &&
          (!date ||
            (created && new Date(created).toISOString().slice(0, 10) === date))
        );
      }),
    [reports, query, risk, grade, date],
  );
  const monthCount = reports.filter((report) => {
    const created = getDate(report);
    const now = new Date();
    const value = created && new Date(created);
    return (
      value &&
      value.getMonth() === now.getMonth() &&
      value.getFullYear() === now.getFullYear()
    );
  }).length;
  const confidenceValues = reports
    .map((report) =>
      Number(report.confidence ?? getAnalysis(report).confidence),
    )
    .filter(Number.isFinite);
  const avgConfidence = confidenceValues.length
    ? `${Math.round(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)}%`
    : null;
  const highRisk = reports.filter(
    (report) => String(getRisk(report) || "").toLowerCase() === "high",
  ).length;
  const logout = async () => {
    setLoggingOut(true);
    await supabase?.auth.signOut();
    navigate("/login", { replace: true });
  };
  return (
    <main className="doctor-dashboard reports-page">
      <DoctorSidebar
        activePath="/reports"
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
            className="reports-hero"
            initial={{ opacity: 0, y: 13 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p>MY REPORTS</p>
              <h1>My Reports</h1>
              <span>View and manage all your retinal analysis reports.</span>
            </div>
            <button onClick={() => navigate("/analysis")}>
              <Plus size={20} />
              New Analysis
            </button>
          </motion.section>
          <section className="report-stats">
            {[
              {
                icon: FileText,
                tone: "mint",
                label: "Total Reports",
                value: reports.length || null,
                sub: reports.length ? "All time" : "No data yet",
              },
              {
                icon: CalendarDays,
                tone: "orange",
                label: "This Month",
                value: monthCount || null,
                sub: monthCount ? "Current month" : "No data yet",
              },
              {
                icon: ShieldCheck,
                tone: "violet",
                label: "High Risk Cases",
                value: highRisk || null,
                sub: highRisk ? "Require follow-up" : "No data yet",
              },
              {
                icon: BarChart3,
                tone: "blue",
                label: "Average Confidence",
                value: avgConfidence,
                sub: avgConfidence
                  ? "Model prediction confidence"
                  : "No data yet",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
              >
                <Stat {...stat} />
              </motion.div>
            ))}
          </section>
          <section className="reports-layout">
            <section className="dashboard-card reports-table-card">
              <div className="report-filters">
                <label>
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search reports by name, ID, or notes..."
                  />
                </label>
                <select
                  value={risk}
                  onChange={(event) => setRisk(event.target.value)}
                  aria-label="Filter by risk level"
                >
                  <option value="">All Risk Levels</option>
                  <option value="normal">Normal</option>
                  <option value="mild">Mild Risk</option>
                  <option value="moderate">Moderate Risk</option>
                  <option value="high">High Risk</option>
                </select>
                <select
                  value={grade}
                  onChange={(event) => setGrade(event.target.value)}
                  aria-label="Filter by DR grade"
                >
                  <option value="">All DR Grades</option>
                  {[0, 1, 2, 3, 4].map((value) => (
                    <option value={String(value)} key={value}>
                      Grade {value}
                    </option>
                  ))}
                </select>
                <label className="date-filter">
                  <input
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    type="date"
                    aria-label="Filter by date"
                  />
                  <ChevronDown size={15} />
                </label>
                <button className="export-button" disabled={!filtered.length}>
                  <Download size={16} />
                  Export
                </button>
              </div>
              {loading ? (
                <div className="reports-empty">
                  <FileText size={30} />
                  <strong>Loading reports…</strong>
                </div>
              ) : filtered.length ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Report Name</th>
                        <th>Date &amp; Time</th>
                        <th>Risk Level</th>
                        <th>DR Grade</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((report, index) => (
                        <motion.tr
                          key={getId(report)}
                          initial={{ opacity: 0, y: 7 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className={
                            selected?.id === report.id ? "selected" : ""
                          }
                        >
                          <td>
                            {report.image_url ? (
                              <img
                                src={report.image_url}
                                alt="Retinal report"
                              />
                            ) : (
                              <span className="no-thumbnail">—</span>
                            )}
                          </td>
                          <td>
                            <strong>{getName(report)}</strong>
                            <small>{getId(report)}</small>
                          </td>
                          <td>{formatDate(getDate(report))}</td>
                          <td>
                            <span
                              className={`risk-badge ${riskTone(getRisk(report))}`}
                            >
                              {getRisk(report) || "—"}
                            </span>
                          </td>
                          <td>{getGrade(report)}</td>
                          <td>
                            <span className="status-badge">
                              {getStatus(report)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="view-button"
                              onClick={() => setSelected(report)}
                            >
                              View
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="reports-empty">
                  <FileText size={32} />
                  <strong>
                    {reports.length ? "No matching reports" : "No reports yet"}
                  </strong>
                  <span>
                    {reports.length
                      ? "Try changing your search or filters."
                      : "Your completed analyses will appear here."}
                  </span>
                  {!isSupabaseConfigured && (
                    <small>Connect Supabase to load your report records.</small>
                  )}
                </div>
              )}
            </section>
            <motion.aside
              className="dashboard-card report-details"
              key={selected?.id || "empty"}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2>Report Details</h2>
              {selected ? (
                <div className="detail-content">
                  <div className="detail-title">
                    {selected.image_url && (
                      <img src={selected.image_url} alt="Retinal report" />
                    )}
                    <div>
                      <strong>{getName(selected)}</strong>
                      <span>{getId(selected)}</span>
                      <i
                        className={`risk-badge ${riskTone(getRisk(selected))}`}
                      >
                        {getRisk(selected)}
                      </i>
                    </div>
                  </div>
                  <div className="detail-tabs">
                    <button className="active">Overview</button>
                    <button>Findings</button>
                    <button>Notes</button>
                  </div>
                  <dl>
                    <div>
                      <dt>Date &amp; Time</dt>
                      <dd>{formatDate(getDate(selected))}</dd>
                    </div>
                    <div>
                      <dt>DR Grade</dt>
                      <dd>{getGrade(selected)}</dd>
                    </div>
                    <div>
                      <dt>Risk Level</dt>
                      <dd>{getRisk(selected) || "—"}</dd>
                    </div>
                    <div>
                      <dt>Confidence</dt>
                      <dd>{selected.confidence ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{getStatus(selected)}</dd>
                    </div>
                  </dl>
                  <button className="full-report">View Full Report →</button>
                  <button className="download-report">Download Report</button>
                </div>
              ) : (
                <div className="details-empty">
                  <Eye size={29} />
                  <strong>Select a report to view details</strong>
                  <span>Choose a completed analysis from the table.</span>
                </div>
              )}
            </motion.aside>
          </section>
          <section className="reports-security">
            <ShieldCheck size={29} />
            <div>
              <strong>Secure Report Storage</strong>
              <span>
                Report records are only accessible to the authenticated doctor
                account.
              </span>
            </div>
            <aside>
              <ShieldCheck size={22} />
              <div>
                <strong>Protected Access</strong>
                <span>Private · Controlled Access</span>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}
