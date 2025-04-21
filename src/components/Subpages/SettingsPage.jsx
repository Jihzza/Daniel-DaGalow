import React from 'react';

const DashboardPage = () => {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h3 className="font-medium">General Settings</h3>
            <p className="text-gray-600">Configure your general preferences</p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-medium">Notifications</h3>
            <p className="text-gray-600">Manage your notification settings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 