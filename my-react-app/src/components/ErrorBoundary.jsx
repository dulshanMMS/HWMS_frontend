import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="bg-white p-4 rounded-lg shadow-lg border border-red-200">
            <h1 className="text-red-800 text-lg font-bold">Something went wrong.</h1>
            <p className="text-gray-800">{this.state.error?.message || "Unknown error"}</p>
            <button
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;