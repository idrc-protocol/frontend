import FallbackImage from "@/components/fallback-image";

export const StepIndicator = ({
  step,
  isActive,
  isCompleted,
  label,
}: {
  step: string;
  isActive: boolean;
  isCompleted: boolean;
  label: string;
}) => (
  <li className="flex items-center gap-3">
    <FallbackImage
      alt={`Step ${step}`}
      className="w-6 h-6 flex-shrink-0"
      height={64}
      src={
        isCompleted || isActive
          ? "/images/icons/step-active.webp"
          : "/images/icons/step-default.webp"
      }
      width={64}
    />
    <span
      className={`text-sm lg:text-base ${
        isActive || isCompleted ? "text-white" : "text-gray-400"
      }`}
    >
      {label}
    </span>
  </li>
);
