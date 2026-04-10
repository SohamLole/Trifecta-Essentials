import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../components/AuthProvider.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import styles from "../styles/AuthPage.module.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, loginWithGoogle, signup } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState("login");
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    identifier: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const redirectTarget = location.state?.from?.pathname || "/";

  const updateField = (field) => (event) => {
    setFormValues((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "signup") {
        await signup({
          username: formValues.username,
          email: formValues.email,
          password: formValues.password
        });
        showToast("Account created successfully.");
      } else {
        await login({
          identifier: formValues.identifier,
          password: formValues.password
        });
        showToast("Welcome back.");
      }

      navigate(redirectTarget, { replace: true });
    } catch (error) {
      showToast(error.response?.data?.message || "Authentication failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    if (!response.credential) {
      showToast("Google sign-in did not return a credential.", "error");
      return;
    }

    setSubmitting(true);

    try {
      await loginWithGoogle(response.credential);
      showToast("Signed in with Google.");
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      showToast(error.response?.data?.message || "Google sign-in failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.brandPanel}>
        <p className={styles.eyebrow}>Secure workspace access</p>
        <h1>Sign in to your private screenshot vault</h1>
        <p>
          Use a unique username and hashed password, or continue with Google OAuth. Every screenshot
          and OCR result is scoped to your account.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={mode === "login" ? styles.activeMode : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "signup" ? styles.activeMode : ""}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <>
              <label>
                <span>Username</span>
                <input
                  type="text"
                  value={formValues.username}
                  onChange={updateField("username")}
                  placeholder="unique_username"
                  autoComplete="username"
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={updateField("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
            </>
          ) : (
            <label>
              <span>Username or Email</span>
              <input
                type="text"
                value={formValues.identifier}
                onChange={updateField("identifier")}
                placeholder="username or email"
                autoComplete="username"
              />
            </label>
          )}

          <label>
            <span>Password</span>
            <input
              type="password"
              value={formValues.password}
              onChange={updateField("password")}
              placeholder="At least 8 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>

          <button className={styles.submitButton} disabled={submitting}>
            {submitting
              ? "Please wait..."
              : mode === "signup"
                ? "Create account"
                : "Login"}
          </button>
        </form>

        <div className={styles.separator}>
          <span>or</span>
        </div>

        {googleClientId ? (
          <div className={styles.googleWrap}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                showToast(
                  "Google sign-in failed. Check the OAuth client origin settings and try again.",
                  "error"
                )
              }
            />
          </div>
        ) : (
          <p className={styles.helperText}>
            Add <code>VITE_GOOGLE_CLIENT_ID</code> to the client env and <code>GOOGLE_CLIENT_ID</code>
            to the server env to enable Google OAuth.
          </p>
        )}
      </div>
    </section>
  );
};

export default AuthPage;
