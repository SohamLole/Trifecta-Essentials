import { Link } from "react-router-dom";

import styles from "../styles/Shared.module.css";

const EmptyState = ({ title, description, actionLabel, actionHref = "/upload" }) => (
  <div className={styles.emptyState}>
    <h3>{title}</h3>
    <p>{description}</p>
    {actionLabel ? (
      <Link to={actionHref} className={styles.primaryAction}>
        {actionLabel}
      </Link>
    ) : null}
  </div>
);

export default EmptyState;
