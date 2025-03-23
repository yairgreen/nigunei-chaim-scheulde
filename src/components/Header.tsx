
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
    <div className="mb-8">
      <div className="flex justify-between items-start mb-6">
        <div className="text-sm font-serif">בס״ד</div>
        <img 
          src="/lovable-uploads/6276adff-5e29-461c-b4e3-b7c42147ebc6.png" 
          alt="ניגוני חיים" 
          className="h-12" 
        />
      </div>
      
      <header className={cn('text-center py-8 animate-fade-in-up', className)}>
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 animate-fade-in" style={{ color: '#604A7B' }}>
            {shabbatName}
          </h1>
          <div className="space-y-1">
            <p className="text-xl text-subtitle font-medium">{hebrewDate}</p>
            <p className="text-sm text-subtitle/80">{gregorianDate}</p>
          </div>
        </div>
        <div className="w-20 h-1 bg-accent1 mx-auto mt-6 rounded-full animate-fade-in"></div>
      </header>
    </div>
  );
};

export default Header;
