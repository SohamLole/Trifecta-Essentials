import styles from "../styles/Shared.module.css";

const Loader = ({ label = "Loading..." }) => (
  <div className={styles.loaderWrap}>
    <div className={styles.loader} />
    <p>{label}</p>
  </div>
);

export default Loader;
