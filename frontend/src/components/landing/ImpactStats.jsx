import { HeartPulse, MapPin, ScanEye, Sprout } from "lucide-react";
const stats = [
  { value: "10M+", label: "Lives We Aim to Impact", icon: HeartPulse },
  { value: "95%", label: "Target Screening Accuracy", icon: ScanEye },
  { value: "Rural Focus", label: "Bridging Healthcare Gaps", icon: MapPin },
  { value: "A Healthier India", label: "Our Shared Vision", icon: Sprout },
];
export default function ImpactStats() {
  return (
    <section
      className="impact-stats"
      id="impact"
      aria-label="Drishti AI impact goals"
    >
      {stats.map(({ value, label, icon: Icon }) => (
        <article key={value}>
          <Icon size={16} />
          <div>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
