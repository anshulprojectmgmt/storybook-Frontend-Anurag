import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clearAuthIntent, getAuthIntent } from "../utils/authIntent";

function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-[calc(100vh-12rem)] bg-gradient-to-b from-[#e8f4ff] via-[#f5fbff] to-white px-4 py-10">
      <div className="mx-auto flex max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-[1.75rem] border border-blue-100 bg-white/95 p-6 shadow-[0_24px_70px_rgba(30,64,175,0.14)] sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-lg">
              S
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#0b2559]">
              {title}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      const intent = getAuthIntent();
      const fallback = location.state?.from || "/";
      const returnTo = intent?.returnTo || fallback;

      if (!returnTo.startsWith("/preview")) {
        clearAuthIntent();
      }

      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Log in to unlock full storybooks and save your progress."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-[#12326f]">
            Email
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-[#0b2559] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-[#12326f]">
            Password
          </span>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 pr-12 text-[#0b2559] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-blue-700 transition hover:bg-blue-100"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </label>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-blue-600 px-6 py-3.5 text-base font-black text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-medium text-slate-600">
        New here?{" "}
        <Link to="/signup" className="font-black text-blue-700 hover:text-blue-900">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

export default Login;
