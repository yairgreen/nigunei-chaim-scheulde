
import React from 'react';

interface AdminHeaderProps {
  isDemoMode: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ isDemoMode }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">ניהול לוח זמנים</h1>
      <div className="flex items-center gap-4">
        {isDemoMode && (
          <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">מצב דמו</span>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
