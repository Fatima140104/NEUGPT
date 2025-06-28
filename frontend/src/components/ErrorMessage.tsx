import React from "react";

export const ErrorMessage: React.FC<{ error: string | null }> = ({ error }) =>
  error ? <div className="text-red-500 text-sm mt-2">{error}</div> : null;
