import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Plus,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { DoctorHeader, DoctorSidebar } from "./DashboardPage";
import "../styles/appointments.css";
import "../styles/appointment-modal.css";

const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const localDateTimeValue = (date) =>
  `${dateKey(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
const appointmentDate = (item) => item.scheduled_at;
const appointmentName = (item) =>
  item.patient_name || item.case_name || "Appointment";
const formatTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";
const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";

function Calendar({
  focus,
  selected,
  appointments,
  scheduleAppointments = appointments,
  today = new Date(),
  onPrevious,
  onNext,
  onSelect,
}) {
  const year = focus.getFullYear(),
    month = focus.getMonth(),
    start = new Date(year, month, 1).getDay(),
    end = new Date(year, month + 1, 0).getDate();
  const cells = Array.from(
    { length: Math.ceil((start + end) / 7) * 7 },
    (_, index) => index - start + 1,
  );
  const appointmentDates = new Set(
    appointments.map((item) => dateKey(new Date(item.scheduled_at))),
  );
  return (
    <section className="dashboard-card appointment-calendar">
      <header>
        <strong>
          {focus.toLocaleString("en-IN", { month: "long", year: "numeric" })}
        </strong>
        <div>
          <button aria-label="Previous month" onClick={onPrevious}>
            <ChevronLeft size={18} />
          </button>
          <button aria-label="Next month" onClick={onNext}>
            <ChevronRight size={18} />
          </button>
        </div>
      </header>
      <div className="weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-days">
        {cells.map((day, index) => {
          const current = day > 0 && day <= end,
            value = current ? new Date(year, month, day) : null,
            key = value && dateKey(value);
          return (
            <button
              disabled={!current}
              className={`${key === dateKey(selected) ? "selected" : ""} ${key === dateKey(today) ? "today" : ""}`}
              key={index}
              onClick={() => current && onSelect(value)}
            >
              {current && (
                <>
                  <span>{day}</span>
                  {appointmentDates.has(key) && <i />}
                </>
              )}
            </button>
          );
        })}
      </div>
      <div className="calendar-legend">
        <span>
          <i className="today" />
          Today
        </span>
        <span>
          <i className="upcoming" />
          Upcoming
        </span>
        <span>
          <i className="completed" />
          Completed
        </span>
        <span>
          <i className="cancelled" />
          Cancelled
        </span>
      </div>
      <div className="today-schedule">
        <header>
          <strong>
            {dateKey(selected) === dateKey(today) ? "Today's" : "Selected Day"}{" "}
            Schedule
          </strong>
          <span>
            {scheduleAppointments.length
              ? `${scheduleAppointments.length} appointments`
              : "No appointments"}
          </span>
        </header>
        {scheduleAppointments.length ? (
          scheduleAppointments.map((item) => (
            <div className="schedule-item" key={item.id}>
              <time>{formatTime(item.scheduled_at)}</time>
              <i />
              <strong>{item.appointment_type}</strong>
            </div>
          ))
        ) : (
          <p>No appointments scheduled</p>
        )}
      </div>
    </section>
  );
}

function NewAppointmentModal({
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}) {
  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  return (
    <motion.div
      className="appointment-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.form
        className="appointment-modal appointment-form"
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
      >
        <button
          className="appointment-modal-close"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <CalendarDays className="appointment-modal-icon" size={28} />
        <h2>New Appointment</h2>
        <div className="appointment-form-fields">
          <label>
            Patient Name{" "}
            <input
              required
              value={form.patientName}
              onChange={set("patientName")}
              placeholder="Enter patient name"
            />
          </label>
          <label>
            Case Name{" "}
            <input
              value={form.caseName}
              onChange={set("caseName")}
              placeholder="Optional case reference"
            />
          </label>
          <label>
            Appointment Type{" "}
            <input
              required
              value={form.appointmentType}
              onChange={set("appointmentType")}
              placeholder="e.g. Retinal screening"
            />
          </label>
          <label>
            Date &amp; Time{" "}
            <input
              required
              type="datetime-local"
              value={form.scheduledAt}
              onChange={set("scheduledAt")}
            />
          </label>
          <label>
            Reason for Visit{" "}
            <textarea
              value={form.reason}
              onChange={set("reason")}
              placeholder="Optional"
            />
          </label>
          <label>
            Notes{" "}
            <textarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="Optional"
            />
          </label>
        </div>
        {error && (
          <p className="appointment-form-error" role="alert">
            {error}
          </p>
        )}
        <button className="appointment-submit" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Create Appointment"}
        </button>
      </motion.form>
    </motion.div>
  );
}

export default function AppointmentsPage() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false),
    [loggingOut, setLoggingOut] = useState(false),
    [appointments, setAppointments] = useState([]),
    [loading, setLoading] = useState(false),
    [now, setNow] = useState(() => new Date()),
    [focus, setFocus] = useState(() => new Date()),
    [selectedDate, setSelectedDate] = useState(() => new Date()),
    [tab, setTab] = useState("upcoming"),
    [type, setType] = useState(""),
    [selected, setSelected] = useState(null),
    [showNew, setShowNew] = useState(false),
    [form, setForm] = useState({
      patientName: "",
      caseName: "",
      appointmentType: "",
      scheduledAt: "",
      reason: "",
      notes: "",
    }),
    [formError, setFormError] = useState(""),
    [savingAppointment, setSavingAppointment] = useState(false),
    [successMessage, setSuccessMessage] = useState("");
  useEffect(() => {
    if (successMessage)
      showToast({ type: "success", title: "Appointment created successfully", message: successMessage });
  }, [successMessage, showToast]);
  useEffect(() => {
    if (formError)
      showToast({ type: "error", title: "Failed to create appointment", message: formError });
  }, [formError, showToast]);
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
  const reload = async () => {
    if (!supabase || !user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", user.id)
      .order("scheduled_at", { ascending: true });
    if (!error) setAppointments(data || []);
    setLoading(false);
  };
  useEffect(() => {
    reload();
  }, [user?.id]);
  const currentDateKeyRef = useRef(dateKey(now));
  useEffect(() => {
    let timer;
    const refreshClock = () => {
      const current = new Date(),
        currentKey = dateKey(current),
        dateChanged = currentKey !== currentDateKeyRef.current;
      currentDateKeyRef.current = currentKey;
      setNow(current);
      if (dateChanged) {
        setSelectedDate(current);
        setFocus(new Date(current.getFullYear(), current.getMonth(), 1));
      }
      const nextMidnight = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate() + 1,
      );
      timer = window.setTimeout(
        refreshClock,
        nextMidnight.getTime() - current.getTime() + 50,
      );
    };
    const onFocus = () => {
      window.clearTimeout(timer);
      refreshClock();
    };
    const onVisibility = () => {
      if (!document.hidden) onFocus();
    };
    refreshClock();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  const selectedDayAppointments = useMemo(
    () =>
      appointments.filter(
        (item) =>
          dateKey(new Date(item.scheduled_at)) === dateKey(selectedDate),
      ),
    [appointments, selectedDate],
  );
  const listed = useMemo(
    () =>
      appointments.filter((item) => {
        const when = new Date(item.scheduled_at),
          status = item.status;
        return (
          (tab === "today"
            ? dateKey(when) === dateKey(now)
            : tab === "completed"
              ? status === "completed"
              : when >= now && !["completed", "cancelled"].includes(status)) &&
          (!type || item.appointment_type === type)
        );
      }),
    [appointments, tab, type, now],
  );
  const typeOptions = [
    ...new Set(appointments.map((item) => item.appointment_type)),
  ];
  const stats = [
    {
      icon: CalendarDays,
      tone: "mint",
      label: "Total Appointments",
      value: appointments.length || null,
    },
    {
      icon: Clock3,
      tone: "orange",
      label: "Today",
      value:
        appointments.filter(
          (item) => dateKey(new Date(item.scheduled_at)) === dateKey(now),
        ).length || null,
    },
    {
      icon: UsersRound,
      tone: "blue",
      label: "Upcoming",
      value:
        appointments.filter(
          (item) =>
            new Date(item.scheduled_at) >= now &&
            !["completed", "cancelled"].includes(item.status),
        ).length || null,
    },
    {
      icon: CheckCircle2,
      tone: "mint",
      label: "Completed",
      value:
        appointments.filter((item) => item.status === "completed").length ||
        null,
    },
  ];
  const createAppointment = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");
    if (!supabase || !user?.id)
      return setFormError(
        "Unable to create the appointment. Please try again.",
      );
    const date = new Date(form.scheduledAt);
    if (
      !form.patientName.trim() ||
      !form.appointmentType.trim() ||
      Number.isNaN(date.getTime())
    )
      return setFormError(
        "Enter the patient name, appointment type, and valid date/time.",
      );
    setSavingAppointment(true);
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        doctor_id: user.id,
        patient_name: form.patientName.trim(),
        case_name: form.caseName.trim() || null,
        appointment_type: form.appointmentType.trim(),
        scheduled_at: date.toISOString(),
        reason: form.reason.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select()
      .single();
    setSavingAppointment(false);
    if (error)
      return setFormError(
        error.message || "Unable to create the appointment. Please try again.",
      );
    await reload();
    setSelected(data);
    setSelectedDate(date);
    setFocus(new Date(date.getFullYear(), date.getMonth(), 1));
    setForm({
      patientName: "",
      caseName: "",
      appointmentType: "",
      scheduledAt: "",
      reason: "",
      notes: "",
    });
    setShowNew(false);
    setSuccessMessage("Appointment created.");
  };
  const logout = async () => {
    setLoggingOut(true);
    const { error } = (await supabase?.auth.signOut()) || {};
    setLoggingOut(false);
    if (error) throw error;
    navigate("/login", { replace: true });
  };
  return (
    <main className="doctor-dashboard appointments-page">
      <DoctorSidebar
        activePath="/appointments"
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
            className="appointments-hero"
            initial={{ opacity: 0, y: 13 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p>APPOINTMENTS</p>
              <h1>Appointments</h1>
              <span>Manage your consultations and schedule.</span>
            </div>
            <button
              onClick={() => {
                setFormError("");
                setShowNew(true);
              }}
            >
              <Plus size={20} />
              New Appointment
            </button>
          </motion.section>
          {successMessage && (
            <p className="appointment-success" role="status">
              {successMessage}
            </p>
          )}
          <section className="appointment-stats">
            {stats.map((stat, index) => (
              <motion.article
                key={stat.label}
                className={`appointment-stat ${stat.tone}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
              >
                <span>
                  <stat.icon size={24} />
                </span>
                <div>
                  <strong>{stat.value ?? "—"}</strong>
                  <p>{stat.label}</p>
                  <small>
                    {stat.value == null ? "No data yet" : "From your records"}
                  </small>
                </div>
              </motion.article>
            ))}
          </section>
          <section className="appointments-layout">
            <Calendar
              focus={focus}
              selected={selectedDate}
              appointments={selectedDayAppointments}
              onPrevious={() =>
                setFocus(
                  (value) =>
                    new Date(value.getFullYear(), value.getMonth() - 1, 1),
                )
              }
              onNext={() =>
                setFocus(
                  (value) =>
                    new Date(value.getFullYear(), value.getMonth() + 1, 1),
                )
              }
              onSelect={setSelectedDate}
            />
            <section className="dashboard-card appointment-list">
              <div className="appointment-tabs">
                <button
                  className={tab === "upcoming" ? "active" : ""}
                  onClick={() => setTab("upcoming")}
                >
                  Upcoming
                </button>
                <button
                  className={tab === "today" ? "active" : ""}
                  onClick={() => setTab("today")}
                >
                  Today
                </button>
                <button
                  className={tab === "completed" ? "active" : ""}
                  onClick={() => setTab("completed")}
                >
                  Completed
                </button>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  <option value="">All Types</option>
                  {typeOptions.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
              {loading ? (
                <div className="appointment-empty">
                  <CalendarDays size={32} />
                  <strong>Loading appointments…</strong>
                </div>
              ) : listed.length ? (
                <div className="appointment-rows">
                  {listed.map((item, index) => (
                    <motion.button
                      key={item.id}
                      className={selected?.id === item.id ? "selected" : ""}
                      onClick={() => setSelected(item)}
                      initial={{ opacity: 0, y: 7 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <span className="appointment-avatar">
                        {appointmentName(item)
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <div>
                        <strong>{appointmentName(item)}</strong>
                        <small>{item.appointment_type}</small>
                        <small>{item.reason || ""}</small>
                      </div>
                      <time>
                        <Clock3 size={14} />
                        {formatTime(item.scheduled_at)}
                        <small>{formatDate(item.scheduled_at)}</small>
                      </time>
                      <i>{item.status}</i>
                      <ChevronRight size={18} />
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="appointment-empty">
                  <CalendarDays size={34} />
                  <strong>No appointments yet</strong>
                  <span>Your scheduled consultations will appear here.</span>
                  {!isSupabaseConfigured && (
                    <small>Connect Supabase to load appointment records.</small>
                  )}
                </div>
              )}
            </section>
            <motion.aside
              className="dashboard-card appointment-details"
              key={selected?.id || "empty"}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2>Appointment Details</h2>
              {selected ? (
                <div className="appointment-detail-content">
                  <div className="detail-person">
                    <span>
                      {appointmentName(selected)
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <div>
                      <strong>{appointmentName(selected)}</strong>
                      <i>{selected.status}</i>
                    </div>
                  </div>
                  <div className="detail-tabs">
                    <button className="active">Details</button>
                    <button>History</button>
                    <button>Notes</button>
                  </div>
                  <dl>
                    <div>
                      <dt>Date &amp; Time</dt>
                      <dd>
                        {formatDate(selected.scheduled_at)}
                        <br />
                        {formatTime(selected.scheduled_at)}
                      </dd>
                    </div>
                    <div>
                      <dt>Appointment Type</dt>
                      <dd>{selected.appointment_type}</dd>
                    </div>
                    {selected.reason && (
                      <div>
                        <dt>Reason for Visit</dt>
                        <dd>{selected.reason}</dd>
                      </div>
                    )}
                    {selected.notes && (
                      <div>
                        <dt>Notes</dt>
                        <dd>{selected.notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              ) : (
                <div className="appointment-details-empty">
                  <Eye size={29} />
                  <strong>Select an appointment to view details.</strong>
                  <span>Choose a scheduled consultation from the list.</span>
                </div>
              )}
            </motion.aside>
          </section>
          <section className="appointments-footer">
            <ShieldCheck size={29} />
            <div>
              <strong>Better Screening. Healthier Communities.</strong>
              <span>
                Your work today helps in early detection and a brighter
                tomorrow.
              </span>
            </div>
            <aside>
              <UsersRound size={24} />
              <strong>
                Together for
                <br />
                Clearer Tomorrows.
              </strong>
            </aside>
          </section>
        </div>
      </div>
      <AnimatePresence>
        {showNew && (
          <NewAppointmentModal
            form={form}
            setForm={setForm}
            error={formError}
            saving={savingAppointment}
            onClose={() => setShowNew(false)}
            onSubmit={createAppointment}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
