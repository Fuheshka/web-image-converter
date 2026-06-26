import React from 'react';

interface ConverterCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ConverterCard({ children, className = '' }: ConverterCardProps) {
  return (
    <div className={`w-full aero-window rounded-3xl p-6 md:p-8 relative overflow-hidden ${className}`}>
      {/* Soft light reflection sweep */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-white/0 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col gap-6 text-slate-800">
        {children}
      </div>
    </div>
  );
}
