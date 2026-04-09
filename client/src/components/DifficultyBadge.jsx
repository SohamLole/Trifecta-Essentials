import styles from "../styles/DifficultyBadge.module.css";

const difficultyClassMap = {
  easy: styles.easy,
  medium: styles.medium,
  hard: styles.hard
};

const DifficultyBadge = ({ difficulty = "medium" }) => (
  <span className={`${styles.badge} ${difficultyClassMap[difficulty] || styles.medium}`}>
    {difficulty}
  </span>
);

export default DifficultyBadge;
