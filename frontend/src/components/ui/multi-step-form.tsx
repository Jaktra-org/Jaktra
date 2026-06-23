import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";
import { Button } from "./Button";
import { Progress } from "./progress";
import { X } from "lucide-react";

const multiStepFormVariants = cva(
  "flex flex-col bg-[#010102] border border-[#23252a] text-[#f7f8f8] rounded-2xl overflow-hidden shadow-2xl max-h-[88vh]",
  {
    variants: {
      size: {
        default: "md:w-[700px] w-full",
        sm: "md:w-[550px] w-full",
        lg: "md:w-[850px] w-full",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface MultiStepFormProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof multiStepFormVariants> {
  currentStep: number;
  totalSteps: number;
  completedStepsCount?: number;
  title: string;
  description: string;
  onBack: () => void;
  onNext: () => void;
  onClose?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  footerContent?: React.ReactNode;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  showBackButton?: boolean;
  showNextButton?: boolean;
}

const MultiStepForm = React.forwardRef<HTMLDivElement, MultiStepFormProps>(
  ({
    className,
    size,
    currentStep,
    totalSteps,
    title,
    description,
    onBack,
    onNext,
    onClose,
    backButtonText = "Back",
    nextButtonText = "Next Step",
    footerContent,
    isNextDisabled = false,
    isNextLoading = false,
    showBackButton = true,
    showNextButton = true,
    children,
    ...props
  }, ref) => {
    const completed = Math.max(0, currentStep - 1);
    const progress = Math.round((completed / totalSteps) * 100);

    const variants = {
      hidden: { opacity: 0, x: 50 },
      enter: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
    };

    return (
      <Card ref={ref} className={cn(multiStepFormVariants({ size }), className)} {...props}>
        <CardHeader className="bg-[#0f1011] border-b border-[#23252a] p-6 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base font-bold text-[#f7f8f8]">{title}</CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close" className="h-7 w-7 p-0 text-[#8a8f98] hover:text-[#f7f8f8]">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription className="text-xs text-[#8a8f98]">{description}</CardDescription>
          <div className="flex items-center gap-4 pt-2">
            <Progress value={progress} className="w-full bg-[#18191c]" />
            <p className="text-xs font-semibold text-[#8a8f98] whitespace-nowrap">
              {completed}/{totalSteps} completed
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 bg-[#0f1011] flex-1 overflow-y-auto min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={variants}
              initial="hidden"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {(footerContent || (showBackButton && currentStep > 1) || showNextButton) && (
          <CardFooter className="flex justify-between items-center bg-[#0f1011] border-t border-[#23252a] p-6 mt-0">
            <div>{footerContent}</div>
            <div className="flex gap-2.5 ml-auto">
              {showBackButton && currentStep > 1 && (
                <Button variant="outline" size="sm" onClick={onBack} type="button">
                  {backButtonText}
                </Button>
              )}
              {showNextButton && (
                <Button variant="primary" size="sm" onClick={onNext} type="button" disabled={isNextDisabled} isLoading={isNextLoading}>
                  {nextButtonText}
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }
);

MultiStepForm.displayName = "MultiStepForm";

export { MultiStepForm };
