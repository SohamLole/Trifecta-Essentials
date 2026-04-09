import styles from "../styles/TagBadge.module.css";

const colorMap = {
  bug: styles.bug,
  ui: styles.ui,
  notes: styles.notes,
  auth: styles.auth,
  api: styles.api,
  general: styles.general
};

const getTagTone = (tag = "") => {
  const normalizedTag = tag.toLowerCase();

  if (normalizedTag.includes("bug")) {
    return styles.bug;
  }

  if (normalizedTag.includes("auth") || normalizedTag.includes("oauth")) {
    return styles.auth;
  }

  if (normalizedTag.includes("api") || normalizedTag.includes("network") || normalizedTag.includes("server")) {
    return styles.api;
  }

  if (normalizedTag.includes("ui") || normalizedTag.includes("layout") || normalizedTag.includes("component")) {
    return styles.ui;
  }

  if (normalizedTag.includes("note")) {
    return styles.notes;
  }

  return colorMap[normalizedTag] || styles.defaultTag;
};

const TagBadge = ({ tag }) => <span className={`${styles.tag} ${getTagTone(tag)}`}>{tag}</span>;

export default TagBadge;
