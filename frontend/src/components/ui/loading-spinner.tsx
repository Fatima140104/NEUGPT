import React from "react";

export const LoadingSpinner: React.FC<{ loadingTitle?: string }> = ({
  loadingTitle,
}) => (
  <div className="flex h-full items-center justify-center py-4">
    <svg
      className="animate-spin h-6 w-6 text-gray-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
    <span className="ml-2 text-gray-500">{loadingTitle || "Loading"}...</span>
  </div>
);
