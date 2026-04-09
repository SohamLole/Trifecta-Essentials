import { NavLink } from "react-router-dom";

import { useAuth } from "./AuthProvider.jsx";
import styles from "../styles/Layout.module.css";

const Layout = ({ children }) => {
  const { logout, user } = useAuth();

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>AI screenshot organizer</p>
          <NavLink to="/" className={styles.brand}>
            SnapSense
          </NavLink>
        </div>

        <div className={styles.headerActions}>
          <nav className={styles.nav}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              Upload
            </NavLink>
          </nav>

          <div className={styles.userChip}>
            <div>
              <p className={styles.userName}>{user?.username}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
            <button type="button" className={styles.logoutButton} onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;
