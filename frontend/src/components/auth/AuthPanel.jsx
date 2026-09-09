import { AnimatePresence, motion } from "framer-motion";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import AuthQuote from "./AuthQuote";
export default function AuthPanel({ mode, setMode, form }) {
  const isLogin = mode === "login";
  return (
    <motion.section
      className="auth-panel"
      layout
      initial={{ opacity: 0, scale: 0.97, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      aria-label={isLogin ? "Login form" : "Sign up form"}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22 }}
        >
          <header className="auth-panel-header">
            <p>{isLogin ? "WELCOME BACK" : "BEGIN YOUR JOURNEY"}</p>
            <h1>
              {isLogin ? (
                <>
                  Welcome <em>Back</em>
                </>
              ) : (
                <>
                  Create Your <em>Account</em>
                </>
              )}
            </h1>
            <span>
              {isLogin
                ? "Sign in to continue your journey towards healthier and brighter tomorrows."
                : "Create your account to begin your journey towards clearer and healthier tomorrows."}
            </span>
          </header>
          {isLogin ? (
            <LoginForm
              {...form}
              onForgot={() =>
                form.setNotice("Password reset will be available soon.")
              }
            />
          ) : (
            <SignupForm {...form} />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="auth-switch">
        {isLogin ? (
          <>
            Don’t have an account?{" "}
            <button onClick={() => setMode("signup")}>Sign Up</button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button onClick={() => setMode("login")}>Login</button>
          </>
        )}
      </div>
      <AuthQuote />
    </motion.section>
  );
}
