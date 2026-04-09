import { Link } from "react-router-dom";

import styles from "../styles/ScreenshotCard.module.css";
import DifficultyBadge from "./DifficultyBadge.jsx";
import ProtectedImage from "./ProtectedImage.jsx";
import TagBadge from "./TagBadge.jsx";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

const ScreenshotCard = ({ screenshot, viewMode = "grid" }) => {
  const snippet = screenshot.extractedText
    ? screenshot.extractedText.slice(0, 140)
    : "OCR text will appear here once the screenshot has been processed.";
  const issueSummary = screenshot.issueSummary || "Resolution guidance will appear after analysis.";
  const displayTags =
    screenshot.issueTags?.length ? screenshot.issueTags : screenshot.detailedTags?.length ? screenshot.detailedTags : screenshot.tags || [];

  return (
    <article
      className={`${styles.card} ${viewMode === "list" ? styles.listCard : styles.gridCard}`}
    >
      <ProtectedImage
        screenshotId={screenshot._id}
        alt="Uploaded screenshot preview"
        className={styles.preview}
        fallbackClassName={`${styles.preview} ${styles.previewFallback}`}
      />

      <div className={styles.cardContent}>
        <div className={styles.cardMeta}>
          <p>{formatDate(screenshot.createdAt)}</p>
          <DifficultyBadge difficulty={screenshot.difficulty} />
        </div>

        <p className={styles.snippet}>{snippet}</p>

        <div className={styles.analysisMeta}>
          <span className={styles.categoryLabel}>{screenshot.issueCategory || "general"}</span>
          <span>{screenshot.issues?.length || 0} issues</span>
        </div>

        <p className={styles.issueSummary}>{issueSummary}</p>

        {screenshot.primaryLocation ? (
          <p className={styles.locationText}>Location: {screenshot.primaryLocation}</p>
        ) : null}

        {displayTags.length ? (
          <div className={styles.detailTagRow}>
            {displayTags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.detailTag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className={styles.tagRow}>
          {displayTags.length
            ? displayTags.map((tag) => <TagBadge key={tag} tag={tag} />)
            : null}
        </div>

        <Link to={`/screenshots/${screenshot._id}`} className={styles.detailLink}>
          View details
        </Link>
      </div>
    </article>
  );
};

export default ScreenshotCard;
