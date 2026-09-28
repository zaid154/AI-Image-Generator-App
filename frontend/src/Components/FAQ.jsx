import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is VividAI really free to use without any credit card?",
    a: "Yes! VividAI uses the open-source FLUX.1-schnell model provided through Hugging Face's serverless inference infrastructure. You don't need any credit card or paid subscription to generate images."
  },
  {
    q: "Which AI model generates the images?",
    a: "We use Black Forest Labs' FLUX.1-schnell, one of the most advanced 12-billion parameter open-weights diffusion models in the world. It excels at photo-realism, complex prompt adherence, and sharp anatomy rendering."
  },
  {
    q: "How does the Prompt Auto-Correction & Enhancement feature work?",
    a: "When you type a prompt (even with typos, broken English, or Hinglish keywords like 'make a pic of a mobile' or 'blue ring of a jin'), our backend AI language model (Qwen 72B) detects the intent, fixes all spelling mistakes, and enriches it with cinematic details before passing it to FLUX.1."
  },
  {
    q: "Can I use the images I generate for commercial projects?",
    a: "Yes! Images generated using FLUX.1-schnell are licensed under the Apache 2.0 open-source license, allowing personal, creative, and commercial use without copyright royalties."
  },
  {
    q: "What resolution and format are the generated images?",
    a: "All images are rendered at crystal-clear 1024 × 1024 resolution in lossless PNG format. You can click the 'Download' button on any image to save it directly to your device."
  },
  {
    q: "How can I get the best possible image results?",
    a: "Check out our 'Prompt Guide' tab! A great prompt specifies: 1. Subject (what you want to see), 2. Environment (where it is), 3. Lighting (e.g. golden hour or neon reflections), and 4. Art Style (e.g. photorealistic 8k or anime aesthetic)."
  }
];

const FAQ = ({ setActiveTab }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <h1 className="text-2xl font-semibold text-white">FAQ</h1>
        <p className="text-sm text-zinc-500 mt-2">
          Everything you need to know about VividAI Studio, models, licensing, and prompt engineering.
        </p>
      </div>

      {/* Accordion list */}
      <div className="mb-12">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="border-b border-white/[0.06]">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between py-4 text-left cursor-pointer"
              >
                <span className="text-sm text-white font-medium">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="pb-4 text-sm text-zinc-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help CTA */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Still have questions?</span>
        <button
          onClick={() => setActiveTab("guide")}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
        >
          Check out the Prompt Guide.
        </button>
      </div>
    </div>
  );
};

export default FAQ;
