import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Field, PasswordField } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";

function AuthLayout({ title, intro, children, footer }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
      <div>
        <h1 className="text-4xl font-extrabold md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-sm text-lg text-muted">{intro}</p>
      </div>
      <div className="rounded-2xl bg-white p-6 ring-1 ring-line md:p-8">
        {children}
        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  );
}

export function Login() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectTo = location.state?.from || "/ai-check";

  if (isLoggedIn) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.identifier, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.status === 401 ? "The username, email or password is incorrect." : errorMessage(err),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      intro="Access your scans, your remaining credits and your PDF reports."
      footer={
        <>
          No account yet?{" "}
          <Link to="/register" state={location.state} className="font-bold text-brand hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {location.state?.registered && (
        <div className="mb-5">
          <Alert tone="success">Your account is ready. Log in to continue.</Alert>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="identifier"
          label="Username or email"
          required
          autoComplete="username"
          value={form.identifier}
          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
        />
        <PasswordField
          id="password"
          label="Password"
          required
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export function Register() {
  const { register, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) return <Navigate to="/ai-check" replace />;

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      navigate("/login", { state: { ...location.state, registered: true } });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      intro="Your account keeps your X-rays and results private and lets you download reports."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" state={location.state} className="font-bold text-brand hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="username"
          label="Username"
          required
          autoComplete="username"
          pattern="[\w.@+\-]+"
          title="Letters, numbers and . _ - @ + only, no spaces"
          hint="No spaces. Letters, numbers and . _ - are allowed."
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value.replace(/\s/g, "") })}
        />
        <Field id="email" label="Email" type="email" required autoComplete="email" value={form.email} onChange={update("email")} />
        <PasswordField
          id="new-password"
          label="Password"
          required
          minLength={8}
          autoComplete="new-password"
          hint="At least 8 characters, not only numbers."
          value={form.password}
          onChange={update("password")}
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating your account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
