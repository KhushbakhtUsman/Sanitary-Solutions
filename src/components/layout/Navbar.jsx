import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Droplet, Menu, X, ShoppingCart, UserCircle, Shield } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const cartCount = getCartItemsCount();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/quote", label: "Request Quote" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Droplet className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-lg font-semibold text-gray-900">Sanitary Solutions</p>
              <p className="text-xs text-gray-500">Premium plumbing essentials</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full bg-blue-600 px-0 text-[10px] text-white">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>


            {isAuthenticated ? (
              <div className="hidden items-center gap-2 md:flex">
                <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                  <UserCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{user?.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : null}

            <button
              className="rounded-lg p-2 text-gray-600 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-3 px-4 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-gray-700"
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-700"
            >
              Admin Login
            </NavLink>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="block text-sm text-gray-700"
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-gray-700"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};
