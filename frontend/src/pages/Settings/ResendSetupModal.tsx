import { useState, useEffect, useRef } from 'react';
import { MultiStepForm } from '../../components/ui/multi-step-form';
import { ResendWizardStep1 } from './ResendWizardStep1';
import { ResendWizardStep2 } from './ResendWizardStep2';
import { ResendWizardStep3 } from './ResendWizardStep3';
import type { ResendSetupProgress } from '../../types/api';

interface ResendSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  resendProgress?: ResendSetupProgress;
  refetch?: () => Promise<unknown>;
}

export function ResendSetupModal({ isOpen, onClose, resendProgress, refetch = async () => {} }: ResendSetupModalProps) {
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(() => {
    if (!resendProgress) return 1;
    if (!resendProgress.step1ApiKey?.isDone) return 1;
    if (!resendProgress.step2SenderAndMode?.isDone) return 2;
    return 3;
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const hasInitializedStep = useRef(false);
  useEffect(() => {
    if (isOpen && resendProgress && !hasInitializedStep.current) {
      const step = !resendProgress.step1ApiKey.isDone
        ? 1
        : !resendProgress.step2SenderAndMode?.isDone
        ? 2
        : 3;
      setWizardStep(step);
      hasInitializedStep.current = true;
    }
    if (!isOpen) {
      hasInitializedStep.current = false;
    }
  }, [isOpen, resendProgress]);

  if (!isOpen) return null;

  const goToStep = (step: 1 | 2 | 3) => {
    setShowExitConfirm(false);
    setWizardStep(step);
  };

  const handleAttemptClose = () => {
    const allDone = resendProgress?.overallStatus === 'active';
    if (allDone) {
      onClose();
    } else {
      setShowExitConfirm(true);
    }
  };

  const getStepTitle = () => {
    return "Resend Setup";
  };

  const getStepDescription = () => {
    switch (wizardStep) {
      case 1: return "Save and validate your Resend API key.";
      case 2: return "Configure your outbound sender identity and reply copy forwarding preferences.";
      case 3: return "Set up DNS MX records and verify inbound email reply webhook parsing.";
      default: return "Complete all steps to activate automated email delivery.";
    }
  };

  const getCompletedStepsCount = () => {
    if (!resendProgress) return Math.max(0, wizardStep - 1);
    let count = 0;
    if (resendProgress.step1ApiKey?.isDone) count++;
    if (resendProgress.step2SenderAndMode?.isDone) count++;
    if (resendProgress.step3InboundWebhook?.isDone) count++;
    return count;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010102]/80 backdrop-blur-sm p-4">
        <MultiStepForm
          size="lg"
          currentStep={wizardStep}
          totalSteps={3}
          completedStepsCount={getCompletedStepsCount()}
          title={getStepTitle()}
          description={getStepDescription()}
          onBack={() => {
            if (wizardStep > 1) goToStep((wizardStep - 1) as 1 | 2 | 3);
          }}
          onNext={() => {
            if (wizardStep < 3) goToStep((wizardStep + 1) as 1 | 2 | 3);
          }}
          onClose={handleAttemptClose}
          showBackButton={false}
          showNextButton={false}
        >
          {!resendProgress ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-[#18191c] rounded w-1/2" />
              <div className="h-4 bg-[#18191c] rounded w-full" />
              <div className="h-4 bg-[#18191c] rounded w-3/4" />
              <div className="h-20 bg-[#18191c] rounded w-full" />
            </div>
          ) : (
            <>
              {wizardStep === 1 && (
                <ResendWizardStep1
                  progress={resendProgress}
                  refetch={refetch}
                  onNext={() => goToStep(2)}
                />
              )}
              {wizardStep === 2 && (
                <ResendWizardStep2
                  progress={resendProgress}
                  refetch={refetch}
                  onNext={() => goToStep(3)}
                  onBack={() => goToStep(1)}
                />
              )}
              {wizardStep === 3 && (
                <ResendWizardStep3
                  progress={resendProgress}
                  refetch={refetch}
                  onBack={() => goToStep(2)}
                  onComplete={onClose}
                />
              )}
            </>
          )}
        </MultiStepForm>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#010102]/90 backdrop-blur-sm p-4">
          <div className="bg-[#0f1011] border border-[#23252a] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-[#f7f8f8]">Exit Resend Setup?</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Your setup is incomplete. Progress saved so far is stored in your draft integration.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all cursor-pointer"
              >
                Continue Setup
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onClose();
                }}
                className="px-3.5 py-1.5 bg-red-950/30 text-red-400 border border-red-900/50 hover:bg-red-950/50 rounded-xl text-xs font-medium transition-all cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
