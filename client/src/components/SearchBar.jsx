import styles from "../styles/SearchBar.module.css";

const SearchBar = ({ value, onChange }) => (
  <label className={styles.searchBar}>
    <span className={styles.searchLabel}>Search screenshots</span>
    <input
      type="search"
      value={value}
      placeholder="Search extracted text or tags..."
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);

export default SearchBar;
