import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./index.css";
import Navbar from "./Components/Navbar";
import ImageGenerator from "./Components/Image Generator/ImageGenerator";
import Gallery from "./Components/Gallery";
import PromptGuide from "./Components/PromptGuide";
import Pricing from "./Components/Pricing";
import FAQ from "./Components/FAQ";
import Footer from "./Components/Footer";
import LegalModal from "./Components/LegalModal";
import BackgroundRemover from "./Components/Tools/BackgroundRemover";
import ImageUpscaler from "./Components/Tools/ImageUpscaler";
import ImageCaptioner from "./Components/Tools/ImageCaptioner";
import Sketchpad from "./Components/Sketchpad/Sketchpad";

function App() {
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState("privacy");
  const navigate = useNavigate();

  const handleSelectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    navigate("/");
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

      {/* Global Header with React Router Navigation */}
      <Navbar />

      {/* Dynamic Main Stage with Real URL Routes */}
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <ImageGenerator
                initialPrompt={selectedPrompt}
                onClearInitialPrompt={handleClearInitialPrompt}
              />
            }
          />
          <Route
            path="/studio"
            element={
              <ImageGenerator
                initialPrompt={selectedPrompt}
                onClearInitialPrompt={handleClearInitialPrompt}
              />
            }
          />
          <Route path="/sketchpad" element={<Sketchpad />} />
          <Route path="/bg-remover" element={<BackgroundRemover />} />
          <Route path="/upscaler" element={<ImageUpscaler />} />
          <Route
            path="/captioner"
            element={
              <ImageCaptioner onSelectPrompt={handleSelectPrompt} />
            }
          />
          <Route
            path="/gallery"
            element={<Gallery onSelectPrompt={handleSelectPrompt} />}
          />
          <Route
            path="/guide"
            element={<PromptGuide onSelectPrompt={handleSelectPrompt} />}
          />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
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
