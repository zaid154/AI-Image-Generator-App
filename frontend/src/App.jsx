import React, { useState } from "react";
import "./index.css";
import Navbar from "./Components/Navbar";
import ImageGenerator from "./Components/Image Generator/ImageGenerator";
import Gallery from "./Components/Gallery";
import PromptGuide from "./Components/PromptGuide";
import Pricing from "./Components/Pricing";
import FAQ from "./Components/FAQ";
import Footer from "./Components/Footer";
import LegalModal from "./Components/LegalModal";
import BackgroundRemover from './Components/Tools/BackgroundRemover';
import ImageUpscaler from './Components/Tools/ImageUpscaler';
import ImageCaptioner from './Components/Tools/ImageCaptioner';

function App() {
  const [activeTab, setActiveTab] = useState("generator");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState("privacy");

  const handleSelectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
  };

  const handleClearInitialPrompt = () => {
    setSelectedPrompt("");
  };

  const handleOpenLegal = (tab = "privacy") => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 flex flex-col justify-between antialiased selection:bg-blue-500/30 selection:text-white">

      {/* Global Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Dynamic Main Stage */}
      <main className="flex-grow">
        {/*
          ImageGenerator is always mounted but hidden via CSS when not active.
          This preserves all state (history, current image, prompt) across tab switches.
        */}
        <div style={{ display: activeTab === "generator" ? "block" : "none" }}>
          <ImageGenerator
            initialPrompt={selectedPrompt}
            onClearInitialPrompt={handleClearInitialPrompt}
          />
        </div>

        {activeTab === "gallery" && (
          <Gallery
            onSelectPrompt={handleSelectPrompt}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'bg-remover' && <BackgroundRemover />}
        {activeTab === 'upscaler' && <ImageUpscaler />}
        {activeTab === 'captioner' && (
          <ImageCaptioner
            onSelectPrompt={handleSelectPrompt}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "guide" && (
          <PromptGuide
            onSelectPrompt={handleSelectPrompt}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "pricing" && (
          <Pricing setActiveTab={setActiveTab} />
        )}

        {activeTab === "faq" && (
          <FAQ setActiveTab={setActiveTab} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onOpenLegal={handleOpenLegal} />

      {/* Legal & Compliance Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
}

export default App;
