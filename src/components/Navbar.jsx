// src/components/Navbar.jsx
import { Link } from "react-router-dom";
const Navbar = () => {
    return (
      <nav className="flex justify-between items-center py-4 px-10 bg-neutral-800 text-white">
        <div className="text-3xl font-bold">Jaltol</div>
        <div className="flex items-center  space-x-8">
          <Link to="/" className="text-xl text-white hover:text-gray-300">Home</Link>
          <a href="#" className="text-xl text-white hover:text-gray-300">Statistics</a>
          <Link to="/impact-assessment" className="text-xl text-white hover:text-gray-300">Assess Impact</Link>
          <a href="#" className="text-xl text-white hover:text-gray-300">About Us</a>
        </div>
      </nav>
    );
  };
  
  export default Navbar;
  