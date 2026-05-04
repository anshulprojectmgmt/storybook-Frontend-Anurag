import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { useCouponAccess } from "../context/CouponContext";

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { pathname } = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const { access } = useCouponAccess();

  const links = [
    { to: "/books", label: "Books for Kids" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
  ];
  const showCouponBanner = isAuthenticated && access?.hasAccess;
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "S";

  useEffect(() => {
    if (!accountOpen) {
      return undefined;
    }

    const closeAccountOnOutsideClick = (event) => {
      if (!event.target.closest("[data-account-menu]")) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", closeAccountOnOutsideClick);
    document.addEventListener("touchstart", closeAccountOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeAccountOnOutsideClick);
      document.removeEventListener("touchstart", closeAccountOnOutsideClick);
    };
  }, [accountOpen]);

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-gradient-to-r from-[#e8f4ff]/95 via-[#d6ebff]/95 to-[#f8fcff]/95 backdrop-blur-xl shadow-[0_10px_35px_rgba(30,64,175,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/"
            className="group inline-flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="rounded-2xl bg-white/80 p-1.5 border border-white/80 shadow-[0_12px_24px_rgba(30,64,175,0.12)]">
              <img
                src="/guidelines/superdadlogo.png"
                alt="Storybook logo"
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-[0.9rem] object-cover"
              />
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-[#0b2559] via-[#1d4ed8] to-[#0ea5e9] bg-clip-text text-transparent drop-shadow-[0_3px_12px_rgba(29,78,216,0.25)]">
              Storybook
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 border border-blue-100 shadow-sm">
            {links.map((link) => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-full text-base font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-[#12326f] hover:bg-blue-100 hover:text-blue-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative" data-account-menu>
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-2 text-sm font-bold text-[#12326f] shadow-sm transition hover:bg-blue-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                    {userInitial}
                  </span>
                  <span className="max-w-[8rem] truncate">
                    {user?.name || "Account"}
                  </span>
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-blue-100 bg-white p-3 shadow-2xl">
                    <p className="truncate text-sm font-bold text-[#0b2559]">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user?.email}
                    </p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-4 py-2 text-sm font-bold text-[#12326f] transition hover:bg-blue-100 hover:text-blue-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700"
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative" data-account-menu>
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="text-[#12326f] hover:text-blue-700 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Account"
                >
                  <UserCircleIcon className="h-7 w-7" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-blue-100 bg-white p-3 text-left shadow-2xl">
                    <p className="truncate text-sm font-bold text-[#0b2559]">
                      {user?.name || "Account"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user?.email}
                    </p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-[#12326f] hover:text-blue-700 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Login"
              >
                <UserCircleIcon className="h-7 w-7" />
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#12326f] hover:text-blue-700 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Toggle menu"
            >
              {isOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="px-2 py-2 space-y-1 bg-white/90 rounded-2xl border border-blue-100 shadow-lg">
              {links.map((link) => {
                const isActive = pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-[#12326f] hover:bg-blue-100 hover:text-blue-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showCouponBanner && (
        <div className="border-t border-blue-100/70 bg-[#e8f4ff]/90 px-4 py-2">
          <div className="mx-auto flex max-w-7xl justify-center sm:justify-end">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-[#12326f] shadow-sm sm:text-sm">
              <span className="truncate">Coupon active</span>
              <span className="h-1 w-1 shrink-0 rounded-full bg-blue-400" />
              <span className="shrink-0">{access.remainingToday} left today</span>
              <span className="hidden shrink-0 text-blue-700 sm:inline">
                till {formatDate(access.accessEndsAt)}
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
