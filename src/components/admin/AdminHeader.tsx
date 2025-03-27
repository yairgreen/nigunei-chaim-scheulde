
import React from 'react';

interface AdminHeaderProps {
  isDemoMode?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ isDemoMode }) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold mb-2">ניהול לוח זמנים</h1>
      <p className="text-gray-600 mb-4">
        עריכת זמני תפילות, שיעורים וזמני שבת
      </p>
    </div>
  );
};

export default AdminHeader;
