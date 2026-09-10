import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  Check,
  CheckCircle2,
  CircleAlert,
  Eye,
  ImageUp,
  Lightbulb,
  ListChecks,
  ScanEye,
  Settings2,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { DoctorHeader, DoctorSidebar } from "./DashboardPage";
import fundusImage from "../assets/images/Fundus-image.png";
import "../styles/analyze-image.css";

function FilePreview({ file, url, onRemove, onChange }) {
  return (
    <motion.div
      className="selected-preview"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <img src={url} alt={`Selected retinal image: ${file.name}`} />
      <div>
        <strong>{file.name}</strong>
        <span>
          {(file.size / 1024 / 1024).toFixed(2)} MB ·{" "}
          {file.type.replace("image/", "").toUpperCase()}
        </span>
        <div className="preview-actions">
          <button onClick={onChange}>Change image</button>
          <button className="remove-image" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AnalyzeImagePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false),
    [loggingOut, setLoggingOut] = useState(false),
    [file, setFile] = useState(null),
    [preview, setPreview] = useState(""),
    [dragging, setDragging] = useState(false),
    [error, setError] = useState(""),
    [status, setStatus] = useState("Ready for quality check"),
    [preparing, setPreparing] = useState(false);
  const inputRef = useRef(null),
    preparationTimerRef = useRef(null);
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
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
      window.clearTimeout(preparationTimerRef.current);
    },
    [preview],
  );
  const choose = (next) => {
    setError("");
    if (!next) return;
    if (!["image/jpeg", "image/png"].includes(next.type))
      return setError("Choose a JPG, JPEG, or PNG image.");
    if (next.size > 10 * 1024 * 1024)
      return setError("The image must be 10 MB or smaller.");
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setStatus("Ready for quality check");
  };
  const remove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setError("");
    setStatus("Ready for quality check");
    if (inputRef.current) inputRef.current.value = "";
  };
  const start = async () => {
    if (!file || preparing) return;
    if (!supabase || !user?.id)
      return setError(
        "Secure upload requires a configured, authenticated Supabase connection.",
      );
    setError("");
    setPreparing(true);
    setStatus("Creating secure analysis record…");
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        doctor_id: user.id,
        original_filename: file.name,
        mime_type: file.type,
        file_size_bytes: file.size,
        status: "uploaded",
        quality_status: "pending",
      })
      .select("id")
      .single();
    if (analysisError || !analysis) {
      setPreparing(false);
      setStatus("Ready for quality check");
      return setError(
        analysisError?.message || "Unable to create an analysis record.",
      );
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const imagePath = `${user.id}/${analysis.id}/${safeName}`;
    setStatus("Uploading image securely…");
    const { error: uploadError } = await supabase.storage
      .from("retinal-images")
      .upload(imagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      await supabase.from("analyses").delete().eq("id", analysis.id);
      setPreparing(false);
      setStatus("Ready for quality check");
      return setError(uploadError.message || "Image upload failed.");
    }
    const { error: updateError } = await supabase
      .from("analyses")
      .update({ image_path: imagePath })
      .eq("id", analysis.id);
    setPreparing(false);
    if (updateError)
      return setError(
        "Image was stored, but the analysis record could not be finalized. Please contact the administrator.",
      );
    setStatus("Image uploaded. Awaiting secure AI model integration.");
  };
  const logout = async () => {
    setLoggingOut(true);
    await supabase?.auth.signOut();
    navigate("/login", { replace: true });
  };
  const steps = [
    "Upload",
    "Quality Check",
    "Preprocessing",
    "AI Analysis",
    "Results",
  ];
  return (
    <main className="doctor-dashboard analysis-page">
      <DoctorSidebar
        activePath="/analysis"
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
            className="analysis-hero"
            initial={{ opacity: 0, y: 13 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p>IMAGE ANALYSIS</p>
              <h1>Analyze Retinal Image</h1>
              <span>
                Upload a fundus image to begin AI-powered retinal screening.
              </span>
            </div>
            <aside>
              <Eye size={28} />
              <strong>
                Clear Images.
                <br />
                Better Insights.
              </strong>
            </aside>
          </motion.section>
          <section className="analysis-stepper" aria-label="Analysis workflow">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`step ${index === 0 ? "current" : ""}`}
              >
                <span>{index === 0 ? <Check size={17} /> : index + 1}</span>
                <strong>{step}</strong>
                {index < steps.length - 1 && <i />}
              </div>
            ))}
          </section>
          <section className="analysis-layout">
            <motion.section
              className="dashboard-card analysis-upload-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <div className="card-heading">
                <div>
                  <span className="card-icon">
                    <ScanEye size={20} />
                  </span>
                  <h2>Upload Fundus Image</h2>
                  <p>
                    Upload a clear retinal fundus image for screening and
                    analysis.
                  </p>
                </div>
              </div>
              <div
                className={`analysis-dropzone ${dragging ? "dragging" : ""} ${error ? "invalid" : ""}`}
                onClick={() => !file && inputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  choose(event.dataTransfer.files?.[0]);
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(event) => choose(event.target.files?.[0])}
                />{" "}
                <AnimatePresence mode="wait">
                  {file ? (
                    <FilePreview
                      key="preview"
                      file={file}
                      url={preview}
                      onRemove={remove}
                      onChange={() => inputRef.current?.click()}
                    />
                  ) : (
                    <motion.div
                      key="empty"
                      className="dropzone-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Upload size={48} />
                      <strong>Drag & drop your retinal image here</strong>
                      <span>or click to browse</span>
                      <small>Supports: JPG, JPEG, PNG (Max 10MB)</small>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          inputRef.current?.click();
                        }}
                      >
                        <Upload size={18} />
                        Choose Image
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {error && (
                <p className="analysis-error" role="alert">
                  <CircleAlert size={16} />
                  {error}
                </p>
              )}
              <p className="quality-status" aria-live="polite">
                <ShieldCheck size={17} />
                Image Quality Check: <strong>{status}</strong>
              </p>
            </motion.section>
            <aside className="analysis-aside">
              <section className="dashboard-card example-card">
                <strong>Sample Image</strong>
                <img src={fundusImage} alt="Example of a normal fundus image" />
                <span>Example of a normal fundus image</span>
                <button
                  onClick={() =>
                    window.open(fundusImage, "_blank", "noopener,noreferrer")
                  }
                >
                  View Example ↗
                </button>
              </section>
              <section className="dashboard-card tips-card">
                <h2>
                  <Lightbulb size={20} />
                  Image Tips for Better Results
                </h2>
                <ul>
                  {[
                    "Use a clear, well-focused fundus image",
                    "Ensure the entire retinal region is visible",
                    "Avoid motion blur",
                    "Use supported JPG, JPEG, PNG format",
                    "Recapture if the image is unclear or dark",
                  ].map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={17} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="quality-note">
                  <CircleAlert size={21} />
                  <span>
                    <strong>Poor Image Quality?</strong>If the image is blurry,
                    too dark, or incomplete, please recapture for accurate
                    analysis.
                  </span>
                </div>
              </section>
            </aside>
            <section className="dashboard-card processing-card">
              <div className="small-card-heading">
                <div>
                  <h2>
                    <Settings2 size={19} />
                    Drishti AI Processing
                  </h2>
                  <p>
                    Your image will go through multiple steps for accurate and
                    reliable analysis.
                  </p>
                </div>
              </div>
              <div className="processing-stages">
                {[
                  {
                    title: "Image Quality",
                    copy: "Check clarity and image quality",
                    icon: ImageUp,
                    tone: "green",
                  },
                  {
                    title: "Preprocessing",
                    copy: "Enhance image & remove noise",
                    icon: Settings2,
                    tone: "orange",
                  },
                  {
                    title: "AI Analysis",
                    copy: "Screen for risk & classify DR (0–4)",
                    icon: BrainCircuit,
                    tone: "blue",
                  },
                ].map(({ title, copy, icon: Icon, tone }) => (
                  <div className={`processing-stage ${tone}`} key={title}>
                    <span>
                      <Icon size={25} />
                    </span>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                    <small>Pending</small>
                  </div>
                ))}
              </div>
            </section>
            <aside className="dashboard-card after-upload">
              <h2>
                <ListChecks size={20} />
                After Upload
              </h2>
              <span>Here’s what happens next:</span>
              {[
                "Image Quality Check",
                "Image Preprocessing",
                "AI Screening",
                "Explainable Results",
                "Report & Recommendation",
              ].map((item, index) => (
                <div key={item}>
                  <b>{index + 1}</b>
                  <p>
                    <strong>{item}</strong>
                    {index === 0 && " — suitable for analysis"}
                    {index === 1 && " — enhance image quality"}
                    {index === 2 && " — future model integration"}
                    {index === 3 && " — visual explanation"}
                    {index === 4 && " — clinical next steps"}
                  </p>
                </div>
              ))}
            </aside>
          </section>
          <section className="analysis-footer">
            <aside>
              <ShieldCheck size={28} />
              <div>
                <strong>Your data is secure and confidential</strong>
                <span>
                  Uploaded images are prepared for encrypted, compliant handling
                  when the imaging service is connected.
                </span>
              </div>
            </aside>
            <div>
              <button
                className="start-analysis"
                disabled={!file || preparing}
                onClick={start}
              >
                {preparing ? "Uploading Image…" : "Upload Image"} <span>→</span>
              </button>
              <p aria-live="polite">
                {file
                  ? "The image will be stored securely and await AI model integration."
                  : "Please upload an image to continue"}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
