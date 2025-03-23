
import React from 'react';
import { cn } from '@/lib/utils';

interface FooterProps {
  greeting?: string;
  contactInfo?: string;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({
  greeting = "שבת שלום ומבורך",
  contactInfo,
  className
}) => {
  return (
    <footer className={cn('py-6 text-center border-t border-gray-100 mt-10', className)}>
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-lg font-medium text-title mb-2">{greeting}</p>
        {contactInfo && (
          <p className="text-sm text-subtitle/70">{contactInfo}</p>
        )}
      </div>
    </footer>
  );
};

export default Footer;
