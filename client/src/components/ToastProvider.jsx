import { createContext, useContext, useMemo, useState } from "react";

import styles from "../styles/Toast.module.css";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  const showToast = (message, type = "success") => {
    const id = crypto.randomUUID();

    setToasts((currentToasts) => [...currentToasts, { id, message, type }]);

    window.setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const value = useMemo(
    () => ({
      showToast
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.toastStack}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${toast.type === "error" ? styles.error : styles.success}`}
          >
            <span>{toast.message}</span>
            <button className={styles.dismissButton} onClick={() => removeToast(toast.id)}>
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
};
