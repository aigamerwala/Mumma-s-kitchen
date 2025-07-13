import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { supabase } from '../../supabaseClient'; // Adjust the import path as necessary
// import { BookOpenIcon, LibraryIcon, ArrowUpIcon, PlusIcon } from '@heroicons/react/outline';
import {
  BookOpenIcon,
  BuildingLibraryIcon, // Replaces `LibraryIcon` in v2
  ArrowUpIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalitems: 0,
    availableitems: 0,
    borrowedBooks: 0,
    newBooks: 0,
    overdueBooks: 0,
    activeMembers: 0,
    totalFines: 0,
    totalCopiesAvailable: 0,
  });
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Total items
        const { count: totalitems } = await supabase
          .from("items")
          .select("*", { count: "exact", head: true });
        console.log("Total items:", totalitems);
        // Available items (copies > 0)
        const { count: availableitems } = await supabase
          .from("items")
          .select("*", { count: "exact", head: true })
          .gt("copies", 0);
        console.log("Available items:", availableitems);

        // Borrowed items (issued_books where returned is false)
        const { count: borrowedBooks } = await supabase
          .from("issued_books")
          .select("*", { count: "exact", head: true })
          .eq("returned", false);
        console.log("Borrowed items:", borrowedBooks);

        // New items (added in the last 30 days)
        const lastMonth = new Date();
        lastMonth.setDate(lastMonth.getDate() - 30);
        const { count: newBooks } = await supabase
          .from("items")
          .select("*", { count: "exact", head: true })
          .gte("created_at", lastMonth.toISOString());
        console.log("New items:", newBooks);
        // Overdue items (due_date < today and returned is false)
        const today = new Date().toISOString();
        const { count: overdueBooks } = await supabase
          .from("issued_books")
          .select("*", { count: "exact", head: true })
          .lt("due_date", today)
          .eq("returned", false);
        console.log("Overdue items:", overdueBooks);
        // Active Members (users table, role === "user")
        const { count: activeMembers } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "member");
        console.log("Active Members:", activeMembers);
        // Total fines collected (sum of fine_amount from transactions)
        const { data: transactions } = await supabase
          .from("transactions")
          .select("fine_amount");
        console.log("Transactions:", transactions);
        const totalFines = transactions?.reduce((sum, t) => sum + (t.fine_amount || 0), 0) || 0;
        console.log("Total Fines:", totalFines);
        // Total copies available (sum of copies > 0)
        const { data: allBooks } = await supabase
          .from("items")
          .select("copies");

        const totalCopiesAvailable = allBooks?.reduce((sum, book) => sum + (book.copies || 0), 0) || 0;
        setStats({
          totalitems,
          availableitems,
          borrowedBooks,
          newBooks,
          overdueBooks,
          activeMembers,
          totalFines,
          totalCopiesAvailable,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error.message);
      }
    };

    fetchDashboardStats();
  }, []);


  // Chart data and options
  const doughnutData = {
    labels: ['New items', 'Issued items', 'Returned items', 'Pending items'],
    datasets: [{
      data: [30, 40, 20, 10],
      backgroundColor: ['#60a5fa', '#3b82f6', '#2563eb', '#1e40af'],
      borderWidth: 0,
      hoverOffset: 15,
    }],
  };

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'items Borrowed', data: [120, 150, 180, 200, 170, 190], backgroundColor: '#60a5fa', borderRadius: 5 },
      { label: 'items Returned', data: [100, 130, 160, 180, 150, 170], backgroundColor: '#2563eb', borderRadius: 5 },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 14, family: 'Inter' } } },
      tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.9)', padding: 12, cornerRadius: 6 },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: '70%',
    animation: { animateRotate: true, animateScale: true },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Number of items', font: { family: 'Inter' } } },
      x: { title: { display: true, text: 'Months', font: { family: 'Inter' } } },
    },
  };

  // Handlers
  const handleSearch = () => {
    if (searchQuery) alert(`Searching for: ${searchQuery}`);
  };

  const addBook = () => navigate('/adminprofile');
  const viewReports = () => navigate("/enquiry-reviews");
  const manageOverdues = () => alert('Opening overdue management panel...');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8 font-sans">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-800 text-transparent bg-clip-text">
          Library Management System
        </h1>
        <div className="mt-6 flex flex-col md:flex-row justify-center gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, users, or transactions..."
            className="px-4 py-3 w-full md:w-80 border-2 border-blue-300 rounded-full focus:outline-none focus:border-blue-500 transition duration-300 bg-white shadow-sm"
          />
          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full hover:from-blue-600 hover:to-blue-800 transition transform hover:-translate-y-1 shadow-lg"
            >
              Search
            </button>
            <button
              onClick={addBook}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full hover:from-blue-600 hover:to-blue-800 transition transform hover:-translate-y-1 shadow-lg"
            >
              Add Book
            </button>
            <button
              onClick={() => navigate("/enquiry-reviews")}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full hover:from-blue-600 hover:to-blue-800 transition transform hover:-translate-y-1 shadow-lg"
            >
              Reviews
            </button>
          </div>
        </div>
      </motion.header>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {[
          { title: 'Total items', value: stats.totalitems, icon: BookOpenIcon, color: 'blue-400', tooltip: 'Total items in collection' },
          { title: 'Available items', value: stats.availableitems, icon: BuildingLibraryIcon, color: 'blue-500', tooltip: 'items ready to borrow' },
          { title: 'Borrowed items', value: stats.borrowedBooks, icon: ArrowUpIcon, color: 'blue-600', tooltip: 'items currently borrowed' },
          { title: 'New items', value: stats.newBooks, icon: PlusIcon, color: 'blue-700', tooltip: 'New additions this month' },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 border-${item.color} hover:shadow-xl transition-all duration-300 group`}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600 uppercase text-sm font-semibold">{item.title}</span>
                <span className="text-3xl font-bold text-blue-800 block mt-1">{item.value}</span>
              </div>
              <div className={`p-3 rounded-full bg-${item.color}/20`}>
                <item.icon className={`w-8 h-8 text-${item.color}`} />
              </div>
            </div>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              {item.tooltip}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mt-12">
        {/* items Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-300 hover:shadow-xl transition-all duration-300 h-96"
        >
          <h2 className="text-xl font-semibold text-blue-800 text-center mb-4">items Distribution</h2>
          <div className="h-64">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </motion.div>

        {/* Monthly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-300 hover:shadow-xl transition-all duration-300 h-96"
        >
          <h2 className="text-xl font-semibold text-blue-800 text-center mb-4">Monthly Activity</h2>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-300 hover:shadow-xl transition-all duration-300 h-96 flex flex-col"
        >
          <h2 className="text-xl font-semibold text-blue-800 text-center mb-4">Quick Stats</h2>
          <div className="flex flex-col gap-4 flex-grow">
            <div className="text-gray-600">Overdue items: <span className="font-bold text-blue-600">{stats.overdueBooks}</span></div>
            <div className="text-gray-600">
              Total Copies Available: <span className="font-bold text-blue-600">{stats.totalCopiesAvailable}</span>
            </div>
            <div className="text-gray-600">Active Members: <span className="font-bold text-blue-600">{stats.activeMembers}</span></div>
            <div className="text-gray-600">Fines Collected: <span className="font-bold text-blue-600">${stats.totalFines.toFixed(2)}</span></div>
          </div>
          <button
            onClick={manageOverdues}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full hover:from-blue-600 hover:to-blue-800 transition transform hover:-translate-y-1 shadow-lg"
          >
            Manage Overdues
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;