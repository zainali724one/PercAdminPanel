import React from "react";

export const Card = ({ children, className = "" }) => (
  <div
    className={`bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-xl ${className}`}
  >
    {children}
  </div>
);
