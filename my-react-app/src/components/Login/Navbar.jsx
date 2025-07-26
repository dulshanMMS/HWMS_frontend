import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const navLinks = [
    { label: "Home", path: "/homepage" },
    { label: "About Us", path: "/about/us" },
  ];

  return (
    <nav
      className={`absolute top-8 left-1/2 transform -translate-x-1/2 w-11/12 max-w-5xl bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl shadow-md flex justify-between items-center z-10 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-12 text-white font-semibold text-sm md:text-base">
        {navLinks.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.path}
              className="relative group transition duration-300"
            >
              {link.label}
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white group-hover:w-full transition-all duration-300 ease-in-out" />
            </a>
          </li>
        ))}
      </ul>

      {/* Auth Buttons - Desktop */}
      <div className="hidden md:flex gap-3">
        <Link to="/">
          <button className="bg-[#0E5D35] text-white font-bold px-4 py-2 rounded-md hover:bg-[#9cc5a7] hover:text-[#0E5D35] transition text-sm md:text-base">
            Sign In
          </button>
        </Link>
        <Link to="/">
          <button className="bg-[#0E5D35] text-white font-bold px-4 py-2 rounded-md hover:bg-white hover:text-[#0E5D35] transition text-sm md:text-base">
            Sign Up
          </button>
        </Link>
      </div>

      {/* Hamburger - Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white text-2xl"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-black/50 shadow-lg rounded-md mt-2 p-4 z-50 md:hidden animate-fadeIn">
          <ul className="flex flex-col gap-4 text-[#f7f8f7] font-semibold text-center">
            {navLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.path} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <button className="bg-[#0E5D35] text-white font-bold px-4 py-2 rounded-md hover:bg-[#9cc5a7] hover:text-[#0E5D35] transition">
              Sign In
            </button>
            <button className="bg-[#0E5D35] text-white font-bold px-4 py-2 rounded-md hover:bg-white hover:text-[#0E5D35] transition">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
