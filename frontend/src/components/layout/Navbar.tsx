import { NavLink,Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4">
      {/* Brand */}
      <Link to="/" className="text-xl font-bold">
        🧠 AI Learning Assistant
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        <NavLink to="/" end className={({ isActive }) =>
            isActive
            ? "text-blue-600 font-semibold"
            : "hover:text-blue-600 transition"
        }>
          Home
        </NavLink>
        <NavLink  to="/login" className={({ isActive }) =>
            isActive
            ? "text-blue-600 font-semibold"
            : "hover:text-blue-600 transition"
        }>
          Login
        </NavLink>
        <NavLink  to="/signup" className={({ isActive }) =>
            isActive
            ? "text-blue-600 font-semibold"
            : "hover:text-blue-600 transition"
        }>
          Signup
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) =>
            isActive
            ? "text-blue-600 font-semibold"
            : "hover:text-blue-600 transition"
        }>
          Dashboard
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;