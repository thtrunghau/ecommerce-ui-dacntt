import React from "react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Đã xảy ra lỗi. Vui lòng thử lại!",
  onRetry,
  className = "",
}) => (
  <div
    className={`flex flex-col items-center justify-center py-8 ${className}`}
  >
    <span className="mb-2 text-xl font-semibold text-red-600">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 rounded bg-black px-4 py-2 text-white transition hover:bg-gray-800"
      >
        Thử lại
      </button>
    )}
  </div>
);

export default ErrorState;
