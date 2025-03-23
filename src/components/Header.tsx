
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  shabbatName: string;
  hebrewDate: string;
  gregorianDate: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  shabbatName,
  hebrewDate,
  gregorianDate,
  className
}) => {
  return (
    <header className={cn('text-center py-10 animate-fade-in-up', className)}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-title mb-2 animate-fade-in">
          {shabbatName}
        </h1>
        <div className="space-y-1">
          <p className="text-xl text-subtitle font-medium">{hebrewDate}</p>
          <p className="text-sm text-subtitle/80">{gregorianDate}</p>
        </div>
      </div>
      <div className="w-20 h-1 bg-accent1 mx-auto mt-6 rounded-full animate-fade-in"></div>
    </header>
  );
};

export default Header;
