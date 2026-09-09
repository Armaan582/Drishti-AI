import { useState } from "react";
import background from "../assets/images/drishti-landing-background.png";
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/landing/HeroSection";
import AccessibilityBadge from "../components/landing/AccessibilityBadge";
import ImpactStats from "../components/landing/ImpactStats";
import VideoModal from "../components/landing/VideoModal";
export default function LandingPage() {
  const [videoOpen, setVideoOpen] = useState(false);
  return (
    <main className="landing-page">
      <div className="artwork-layer" aria-hidden="true">
        <img src={background} alt="" />
      </div>
      <div className="ui-layer">
        <Navbar />
        <HeroSection onWatch={() => setVideoOpen(true)} />
        <AccessibilityBadge />
        <ImpactStats />
      </div>
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </main>
  );
}
