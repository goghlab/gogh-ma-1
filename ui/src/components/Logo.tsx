import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", className = "" }) => {
  const containerSizes = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  const triangleSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  const clipPathSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div
      className={`${containerSizes[size]} bg-zinc-900 flex items-center justify-center text-white relative overflow-hidden shadow-lg px-3 ${className}`}
    >
      <div className={`${triangleSizes[size]} mr-2 relative flex items-center justify-center`}>
        <div
          className={`absolute ${clipPathSizes[size]} overflow-hidden`}
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #d4d4d8 0%, #71717a 100%)" }}
          ></div>
        </div>
      </div>
      <span className={`${textSizes[size]} font-mono tracking-[0.2em] relative z-10 text-zinc-300 uppercase font-light`}>
        MA-1
      </span>
    </div>
  );
};

export default Logo; 