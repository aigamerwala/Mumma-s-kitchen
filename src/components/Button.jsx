import React from "react";

const Button = ({ text, onClick }) => {
  return (
    <button
      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
