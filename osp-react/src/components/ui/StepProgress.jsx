const STEP_STYLES = {
  active: { circle: 'bg-violet-600 text-white', label: 'text-violet-600' },
  done: { circle: 'bg-emerald-500 text-white', label: 'text-emerald-600' },
  inactive: { circle: 'bg-gray-200 text-gray-400', label: 'text-gray-400' },
};

function getStepState(stepIndex, currentStep) {
  if (stepIndex < currentStep) return 'done';
  if (stepIndex === currentStep) return 'active';
  return 'inactive';
}

export default function StepProgress({ steps, currentStep }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const state = getStepState(idx + 1, currentStep);
          const style = STEP_STYLES[state];
          const Icon = step.icon;

          return (
            <div key={idx} className="contents">
              {/* Step circle + label */}
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${style.circle}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="hidden sm:block">
                  <p className={`text-xs font-semibold transition-colors ${style.label}`}>
                    Step {idx + 1}
                  </p>
                  <p className="text-[11px] text-gray-500">{step.label}</p>
                </div>
              </div>

              {/* Connector line (kecuali step terakhir) */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-3 h-0.5 bg-gray-200 rounded-full relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-violet-600 rounded-full transition-all duration-500"
                    style={{ width: idx + 1 < currentStep ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
