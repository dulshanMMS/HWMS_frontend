
const Navbar = () => {
  return (
    <nav className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4/5 bg-black/20 backdrop-blur-md p-3 px-6 rounded-xl shadow-md flex justify-between items-center z-10 md:flex">
      <ul className="flex gap-6 text-white font-semibold text-base">
        <li><a href="#">Home</a></li>
        <li><a href="/about/us">About Us</a></li>
        <li><a href="#">Resources</a></li>
      </ul>
      <button className="bg-[#0E5D35] text-white font-bold px-4 py-2 rounded-md hover:bg-[#9cc5a7] hover:text-[#0E5D35] transition">
        Sign In
      </button>
    </nav>
  );
};

export default Navbar;
