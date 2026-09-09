import { Mail } from "lucide-react";
import AuthInput from "./AuthInput";
import PasswordInput from "./PasswordInput";
export default function LoginForm({
  values,
  errors,
  onChange,
  onSubmit,
  loading,
  onForgot,
}) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <AuthInput
        label="EMAIL ADDRESS"
        icon={Mail}
        type="email"
        name="email"
        value={values.email}
        onChange={onChange}
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email}
      />
      <PasswordInput
        label="PASSWORD"
        name="password"
        value={values.password}
        onChange={onChange}
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password}
      />
      <div className="form-options">
        <label className="remember">
          <input
            type="checkbox"
            name="remember"
            checked={values.remember}
            onChange={onChange}
          />
          <span />
          Remember me
        </label>
        <button type="button" onClick={onForgot}>
          Forgot Password?
        </button>
      </div>
      <button className="auth-submit" disabled={loading}>
        {loading ? (
          <><span className="spinner" /> Signing in…</>
        ) : (
          <>
            Login <b>→</b>
          </>
        )}
      </button>
    </form>
  );
}
