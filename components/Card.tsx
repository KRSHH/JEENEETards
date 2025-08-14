
import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col h-full">
      <div className="flex items-center mb-4">
        {icon && <div className="text-slate-400 mr-3">{icon}</div>}
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      </div>
      <div className="flex-grow h-80">
        {children}
      </div>
    </div>
  );
};

export default Card;
