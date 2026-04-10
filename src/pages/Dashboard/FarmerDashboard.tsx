import React from 'react';

const FarmerDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Farmer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded shadow font-semibold">Total Revenue: 5,000,000 VND</div>
        <div className="bg-green-100 p-4 rounded shadow font-semibold">Orders Pending: 12</div>
        <div className="bg-yellow-100 p-4 rounded shadow font-semibold">Active Products: 8</div>
        <div className="bg-purple-100 p-4 rounded shadow font-semibold">Verified Diaries: 5</div>
      </div>
      
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Add New Product</button>
          <button className="bg-green-500 text-white px-4 py-2 rounded">Update Growth Diary</button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded">Manage Orders</button>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
