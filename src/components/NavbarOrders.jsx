import React from "react";
import { Link } from "react-router-dom";

const NavbarOrders = ({days,activeDay,onDayClick}) => {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white fixed top-15 left-0 p-6">
      <h2 className="text-xl font-bold mb-6 ml-10">Order Menu</h2>
      <ul className="space-y-4">
        {/* <li><Link to="/order" className="block hover:text-blue-400">📚 All Items</Link></li>
        <li><Link to="/available-books" className="block hover:text-blue-400"> Available Items</Link></li>
        <li><Link to="/issued-books" className="block hover:text-blue-400"> Sunday Specials</Link></li>
        <li><Link to="/reservations" className="block hover:text-blue-400"> Monday Specials</Link></li>
        <li><Link to="/ebooks" className="block hover:text-blue-400"> Tuesday Specials</Link></li>
        <li><Link to="/audiobooks" className="block hover:text-blue-400"> Wednesday Specials</Link></li>
        <li><Link to="/enquiry" className="block hover:text-blue-400"> Thursday Specials</Link></li>
        <li><Link to="/enquiry-reviews" className="block hover:text-blue-400"> Friday Specials</Link></li>
        <li><Link to="/quiz" className="block hover:text-blue-400"> Saturday Specials</Link></li> */}
        {days.map((day) => (
          <li key={day}>
            <Link
              to={`/menu/${day}`}
              className={`block hover:text-blue-400 ${activeDay === day ? "text-blue-400 font-bold" : ""}`}
              onClick={() => onDayClick(day)}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavbarOrders;
