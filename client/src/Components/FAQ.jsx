import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is VividAI really free to use without any credit card?",
    a: "Yes. VividAI utilizes the open-weights FLUX.1-schnell model running via serverless GPU inference. No credit card or paid account is required to generate images."
  },
  {
    q: "Which AI model generates the images?",
    a: "Image generation is powered by Black Forest Labs' FLUX.1-schnell, a state-of-the-art 12-billion parameter flow transformer model. It produces high anatomical accuracy, crisp text, and nuanced photorealistic textures in 4 inference steps."
  },
  {
    q: "How does Prompt Auto-Correction & Enhancement work?",
    a: "Before passing your text to FLUX.1, an instruction-tuned language model (Qwen 2.5-72B) analyzes your input to correct typographical errors, fix informal syntax or Hinglish, and expand the description with photographic details regarding lighting, medium, and atmosphere."
  },
  {
    q: "Can I use generated images for commercial projects?",
    a: "Yes. Images generated using FLUX.1-schnell are governed by the Apache 2.0 open-weights license, permitting personal, creative, and commercial use royalty-free."
  },
  {
    q: "What resolution and format are the outputs?",
    a: "Images are synthesized at native 1024 × 1024 resolution and exported as lossless PNG files. You can download them directly to your device with no watermarks."
  },
  {
    q: "How can I get the best results from the model?",
    a: "Structure your prompt with 4 clear elements: Subject (what you want to see), Environment (where it takes place), Lighting (e.g. golden hour or volumetric beam), and Medium (e.g. 85mm medium format or architectural photography). Check our Prompt Guide tab for practical examples."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="max-w-2xl mb-10">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Frequently Asked Questions</h1>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
          Technical specifications, licensing permissions, and usage details for VividAI Studio.
        </p>
      </div>

      {/* Accordion list */}
      <div className="mb-12 divide-y divide-white/[0.06] border-y border-white/[0.06]">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="py-1">
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
                className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
              >
                <span className="text-sm text-zinc-200 font-medium group-hover:text-white transition-colors pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-white" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className="pb-4 text-xs sm:text-sm text-zinc-400 leading-relaxed pr-6"
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-zinc-900/30 border border-white/[0.06]">
        <span className="text-xs sm:text-sm text-zinc-300">Looking for tips to improve your generations?</span>
        <button
          onClick={() => navigate("/guide")}
          className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          Explore Prompt Engineering Guide →
        </button>
      </div>
    </div>
  );
};

export default FAQ;
