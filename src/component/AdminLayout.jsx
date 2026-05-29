import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Film,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/movies", label: "Movies", icon: Film },
  { to: "/admin/hero", label: "Hero Section", icon: Sparkles },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/admin/account", label: "My account", icon: UserCircle },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 mt-10 border border-white/10 bg-white/[0.03] rounded-xl px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <p className="text-gray-400 text-sm">CinemaHouse management console</p>
          </div>
          <Link
            to="/"
            className="w-fit flex items-center gap-2 text-sm text-gray-300 hover:text-white transition border border-white/15 rounded-lg px-3 py-2 bg-white/[0.02]"
          >
            <ArrowLeft size={16} />
            Back to site
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-60 shrink-0">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 border border-white/10 rounded-xl p-2 bg-white/[0.03]">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg"
                        : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0 border border-white/10 rounded-xl p-4 md:p-6 bg-white/[0.03]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
