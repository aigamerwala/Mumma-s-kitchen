import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FaBook, FaChartBar, FaChartPie, FaUser, FaDollarSign } from 'react-icons/fa';

// Sample data (replace with actual data from your DBMS)
const totalBooksData = [
  { name: 'Total Books', value: 1245 },
  { name: 'Available', value: 892 },
  { name: 'Borrowed', value: 353 },
  { name: 'New Books', value: 45 },
];

const monthlyActivityData = [
  { name: 'Jan', books: 80 },
  { name: 'Feb', books: 120 },
  { name: 'Mar', books: 150 },
  { name: 'Apr', books: 180 },
  { name: 'May', books: 140 },
  { name: 'Jun', books: 160 },
];

const quickStatsData = [
  { name: 'Overdue Books', value: 12 },
  { name: 'Active Members', value: 287 },
  { name: 'Fines Collected', value: 45.50 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AddBook = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Add search logic here (e.g., filter books, users, or transactions)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-6 animate-pulse">Library Management System</h1>

      {/* Search and Buttons Section */}
      <div className="flex justify-center items-center space-x-4 mb-8">
        <input
          type="text"
          placeholder="Search books, users, or transactions"
          value={searchQuery}
          onChange={handleSearch}
          className="p-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-105 transform">
          Search
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-105 transform">
          Add Book
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-105 transform">
          Reports
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {totalBooksData.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-blue-700">{item.name}</h3>
              <p className="text-2xl font-bold text-blue-900">{item.value}</p>
            </div>
            <FaBook className="text-blue-500 text-2xl" />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div classBooks="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <FaChartPie className="mr-2" /> Books Distribution
          </h2>
          <PieChart width={400} height={300}>
            <Pie
              data={totalBooksData}
              cx={200}
              cy={150}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {totalBooksData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <FaChartBar className="mr-2" /> Monthly Activity
          </h2>
          <BarChart width={400} height={300} data={monthlyActivityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="books" fill="#0088FE" />
          </BarChart>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
          <FaUser className="mr-2" /> Quick Stats
        </h2>
        <div className="space-y-2">
          {quickStatsData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-blue-900">{item.name}</span>
              <span className="text-blue-700 font-semibold">
                {item.name === 'Fines Collected' ? `$${item.value}` : item.value}
                {item.name === 'Fines Collected' ? <FaDollarSign className="inline ml-1" /> : null}
              </span>
            </div>
          ))}
        </div>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-105 transform w-full">
          Manage Overdues
        </button>
      </div>

      {/* Privacy Note */}
      <div className="mt-8 text-center text-gray-600">
        <p>
          <strong>Note:</strong> User data privacy is maintained. All personal information is encrypted and accessible only to authorized personnel.
        </p>
      </div>
    </div>
  );
};

export default AddBook;