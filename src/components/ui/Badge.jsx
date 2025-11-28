import React from "react";

export const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-900/50 text-blue-200 border-blue-700",
    green: "bg-green-900/50 text-green-200 border-green-700",
    purple: "bg-purple-900/50 text-purple-200 border-purple-700",
    gray: "bg-gray-700/50 text-gray-300 border-gray-600",
    yellow: "bg-yellow-900/50 text-yellow-200 border-yellow-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium border ${
        colors[color] || colors.gray
      }`}
    >
      {children}
    </span>
  );
};
