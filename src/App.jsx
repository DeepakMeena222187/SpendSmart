// ─────────────────────────────────────────────────────────────
//  App.jsx  –  decides what to show based on login state
//  If user is logged in → Dashboard
//  If not             → Login page
// ─────────────────────────────────────────────────────────────
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login     from "./pages/Login";

export default function App() {
  const { user } = useAuth();

  // user is null  → not logged in → show Login
  // user is set   → logged in     → show Dashboard
  return user ? <Dashboard /> : <Login />;
}
