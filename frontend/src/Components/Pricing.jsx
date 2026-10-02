import React, { useState } from "react";
import { Check, Info, X } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Community",
    price: "$0",
    period: "forever",
    description: "Open-access AI image generation powered by open-weights FLUX.1.",
    buttonText: "Active in Studio",
    buttonVariant: "current",
    statusBadge: "Active Plan",
    features: [
      "FLUX.1-schnell 12B diffusion model",
      "Full 1024 × 1024 px PNG resolution",
      "AI prompt auto-correction (Qwen 72B)",
      "Instant lossless PNG downloads",
      "Curated Community Gallery access",
      "Apache 2.0 commercial output license"
    ]
  },
  {
    id: "pro",
    name: "Creator Pro",
    price: "$12",
    period: "month",
    description: "Dedicated GPU queue and enhanced aspect ratio controls for designers.",
    buttonText: "Join Waitlist",
    buttonVariant: "primary",
    statusBadge: "Coming Soon",
    features: [
      "Everything in Community",
      "Dedicated GPU warm queue (~1.5s latency)",
      "Aspect ratio selector (16:9, 9:16, 4:3, 1:1)",
      "Concurrent 4-image batch generation",
      "Higher diffusion sampling step ceiling",
      "Early access to new fine-tuned FLUX models"
    ]
  },
  {
    id: "enterprise",
    name: "Custom / Self-Hosted",
    price: "Custom",
    period: "license",
    description: "Deploy VividAI on your own private cloud or Hugging Face dedicated inference endpoint.",
    buttonText: "Documentation & Setup",
    buttonVariant: "secondary",
    statusBadge: "Open Source",
    features: [
      "Full open-source React & Express codebase",
      "Bring your own Hugging Face token",
      "Self-host on Docker or internal VPC",
      "Zero data leakage / private generations",
      "Compatible with custom LoRA weights"
    ]
  }
];

const Pricing = ({ setActiveTab }) => {
  const [modalMessage, setModalMessage] = useState(null);

  const handleAction = (plan) => {
    if (plan.id === "free") {
      if (setActiveTab) setActiveTab("generator");
    } else if (plan.id === "pro") {
      setModalMessage({
        title: "Creator Pro — Waitlist Open",
        description:
          "VividAI is currently 100% free while running on serverless inference. Dedicated GPU tier integration with Stripe billing is scheduled for upcoming releases. Stay tuned on GitHub for release updates!"
      });
    } else if (plan.id === "enterprise") {
      setModalMessage({
        title: "Self-Hosting & Custom Deployment",
        description:
          "You can clone this repository directly from GitHub, configure your own HF_ACCESS_TOKEN in backend/.env, and run your own private instance on any cloud or local GPU server with zero subscription fees."
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Plans &amp; Deployment</h1>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
          VividAI is free to use with your open-source setup. Compare features below or explore self-hosting options.
        </p>
      </div>

      {/* Info Notice Banner */}
      {modalMessage && (
        <div className="mb-8 p-4 rounded-lg bg-zinc-900 border border-blue-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-medium text-white">{modalMessage.title}</h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{modalMessage.description}</p>
            </div>
          </div>
          <button
            onClick={() => setModalMessage(null)}
            className="text-zinc-400 hover:text-white p-1 transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isPrimary = plan.buttonVariant === "primary";
          const isCurrent = plan.buttonVariant === "current";

          return (
            <div
              key={plan.id}
              className={`bg-zinc-900/20 rounded-lg p-6 flex flex-col justify-between border ${
                isPrimary
                  ? "border-blue-500/40"
                  : "border-white/[0.06]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-semibold text-white">{plan.name}</h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      isPrimary
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-white/[0.04] text-zinc-400 border border-white/[0.06]"
                    }`}
                  >
                    {plan.statusBadge}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 min-h-[34px] leading-relaxed">{plan.description}</p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mt-5 mb-6 pb-6 border-b border-white/[0.04]">
                  <span className="text-3xl font-semibold text-white">{plan.price}</span>
                  <span className="text-xs text-zinc-400">/{plan.period}</span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-zinc-300 leading-normal">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleAction(plan)}
                className={`w-full py-2 px-4 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isPrimary
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : isCurrent
                    ? "bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.08]"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06]"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;
