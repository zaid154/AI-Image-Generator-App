import React from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter Free",
    badge: "Current Plan",
    price: "$0",
    period: "forever",
    description: "Perfect for hobbyists, students, and creative experimenters.",
    buttonText: "Active Plan",
    buttonVariant: "outline",
    features: [
      "FLUX.1-schnell model access",
      "Standard 1024 × 1024 px resolution",
      "AI Prompt Auto-Corrector (Qwen 72B)",
      "Instant high-res PNG downloads",
      "Community Gallery access",
      "Standard inference queue"
    ]
  },
  {
    name: "Pro Creator",
    badge: "Popular",
    price: "$12",
    period: "per month",
    description: "For digital artists, designers, and professional content creators.",
    buttonText: "Upgrade to Pro (Coming Soon)",
    buttonVariant: "primary",
    features: [
      "Everything in Starter Free",
      "Ultra-Fast Turbo GPU Priority Queue",
      "4K & 8K AI Image Upscaling",
      "Generate 4 Images Simultaneously",
      "Private generations (Unlisted)",
      "Full Commercial Copyright License",
      "Priority 24/7 Creator Support"
    ]
  },
  {
    name: "Studio Enterprise",
    badge: "Custom",
    price: "$49",
    period: "per month",
    description: "For agencies, marketing teams, and high-volume commercial production.",
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    features: [
      "Everything in Pro Creator",
      "Dedicated High-Throughput API Endpoints",
      "Custom LoRA model fine-tuning",
      "Team collaboration & shared workspace",
      "Unlimited batch generation",
      "99.9% Uptime Service Level Agreement (SLA)"
    ]
  }
];

const Pricing = ({ setActiveTab }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <h1 className="text-2xl font-semibold text-white">Pricing</h1>
        <p className="text-sm text-zinc-500 mt-2">
          Start 100% free with unlimited open-source AI image generation. Upgrade when you need turbo speed and 4K upscaling.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const isPrimary = plan.buttonVariant === "primary";
          return (
            <div
              key={index}
              className={`bg-zinc-900/20 rounded-lg p-6 flex flex-col justify-between ${
                isPrimary ? "border border-blue-500/40" : "border border-white/[0.06]"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium text-white">{plan.name}</h3>
                  {isPrimary && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 min-h-[40px]">{plan.description}</p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mt-6 mb-8">
                  <span className="text-3xl font-semibold text-white">{plan.price}</span>
                  <span className="text-xs text-zinc-500">/{plan.period}</span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (plan.buttonVariant === "outline" && plan.price === "$0") {
                    setActiveTab("generator");
                  } else {
                    alert(`${plan.name} will be available soon with Stripe checkout integration!`);
                  }
                }}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isPrimary
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.06]"
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
