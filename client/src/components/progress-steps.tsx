import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  currentStep: number;
  steps?: { label: string; number: number }[];
}

export default function ProgressSteps({ 
  currentStep,
  steps = [
    { label: "Select Date", number: 1 },
    { label: "Review & Pay", number: 2 },
    { label: "Confirmation", number: 3 }
  ]
}: ProgressStepsProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step) => (
          <span 
            key={step.number}
            className={cn(
              "font-semibold text-lg",
              currentStep === step.number ? "text-navy" : "text-neutral-400"
            )}
          >
            {step.label}
          </span>
        ))}
      </div>
      <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-coral rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export { ProgressSteps };
