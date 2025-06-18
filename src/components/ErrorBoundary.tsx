import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log error to an error reporting service here
    // Example: errorHandler.log(error, errorInfo);
    // For now, just log to console
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">
            Đã xảy ra lỗi không mong muốn!
          </h2>
          <p className="mb-2 text-gray-700">
            Vui lòng thử lại hoặc liên hệ quản trị viên.
          </p>
          <pre className="max-w-xl overflow-x-auto rounded bg-gray-100 p-2 text-xs text-gray-500">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
