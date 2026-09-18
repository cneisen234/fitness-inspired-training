import LoginForm from "./login-form";

// Login is intentionally outside the guarded admin shell (its own route + layout),
// so the requireAdmin() guard never runs here and there's no redirect loop.
export default function AdminLoginPage() {
  return (
    <div className="admin-login-card">
      <h1>Fitness Inspired Training</h1>
      <p className="sub">Admin console — sign in to manage blog posts and reviews.</p>
      <LoginForm />
    </div>
  );
}
