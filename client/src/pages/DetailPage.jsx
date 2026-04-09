import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DifficultyBadge from "../components/DifficultyBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";
import ProtectedImage from "../components/ProtectedImage.jsx";
import TagBadge from "../components/TagBadge.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import {
  deleteScreenshot,
  getScreenshotById,
  updateScreenshotTags
} from "../services/screenshotService.js";
import styles from "../styles/DetailPage.module.css";

const DetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const [screenshot, setScreenshot] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const groupedIssues = useMemo(() => {
    const groups = new Map();

    (screenshot?.issues || []).forEach((issue) => {
      const key = issue.detailedTag || "general issue";
      const existing = groups.get(key) || [];
      existing.push(issue);
      groups.set(key, existing);
    });

    return Array.from(groups.entries());
  }, [screenshot]);

  useEffect(() => {
    const loadScreenshot = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getScreenshotById(id);
        setScreenshot(response.data);
        setTagInput((response.data.issueTags?.length ? response.data.issueTags : response.data.tags).join(", "));
      } catch (error) {
        const message = error.response?.data?.message || "Unable to load this screenshot.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    loadScreenshot();
  }, [id]);

  const handleTagSave = async (event) => {
    event.preventDefault();

    if (!screenshot) {
      return;
    }

    setSaving(true);

    try {
      const tags = tagInput
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);

      const response = await updateScreenshotTags(screenshot._id, tags);
      setScreenshot(response.data);
      setTagInput((response.data.issueTags?.length ? response.data.issueTags : response.data.tags).join(", "));
      showToast("Tags updated.");
    } catch (error) {
      const message = error.response?.data?.message || "Unable to update tags.";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!screenshot || !window.confirm("Delete this screenshot from SnapSense?")) {
      return;
    }

    setDeleting(true);

    try {
      await deleteScreenshot(screenshot._id);
      showToast("Screenshot deleted.");
      navigate("/");
    } catch (error) {
      const message = error.response?.data?.message || "Unable to delete screenshot.";
      showToast(message, "error");
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading screenshot details..." />;
  }

  if (errorMessage) {
    return (
      <EmptyState
        title="Screenshot unavailable"
        description={errorMessage}
        actionLabel="Back to dashboard"
        actionHref="/"
      />
    );
  }

  if (!screenshot) {
    return null;
  }

  const displayTags =
    screenshot.issueTags?.length ? screenshot.issueTags : screenshot.detailedTags?.length ? screenshot.detailedTags : screenshot.tags || [];

  return (
    <section className={styles.page}>
      <Link to="/" className={styles.backLink}>
        Back to dashboard
      </Link>

      <div className={styles.layout}>
        <div className={styles.previewPanel}>
          <ProtectedImage
            screenshotId={screenshot._id}
            alt="Screenshot preview"
            className={styles.previewImage}
            fallbackClassName={styles.previewFallback}
          />
        </div>

        <div className={styles.sidebar}>
          <div className={styles.metaCard}>
            <p className={styles.eyebrow}>Captured on</p>
            <h1>{new Date(screenshot.createdAt).toLocaleString()}</h1>
            <div className={styles.issueHeader}>
              <span className={styles.categoryPill}>{screenshot.issueCategory || "general"}</span>
              <DifficultyBadge difficulty={screenshot.difficulty} />
            </div>
            <p className={styles.issueSummary}>
              {screenshot.issueSummary || "No issue summary is available for this screenshot yet."}
            </p>
            {screenshot.primaryLocation ? (
              <p className={styles.locationLead}>Primary location: {screenshot.primaryLocation}</p>
            ) : null}

            <div className={styles.tagRow}>
              {displayTags.length
                ? displayTags.map((tag) => <TagBadge key={tag} tag={tag} />)
                : null}
            </div>
          </div>

          <div className={styles.textCard}>
            <h2>Extracted text</h2>
            <p>{screenshot.extractedText || "OCR did not find readable text in this screenshot."}</p>
          </div>

          <div className={styles.textCard}>
            <h2>Issue breakdown by tag</h2>
            {groupedIssues.length ? (
              <div className={styles.issueGroupList}>
                {groupedIssues.map(([detailedTag, issues]) => (
                  <section key={detailedTag} className={styles.issueGroup}>
                    <h3>{detailedTag}</h3>
                    {issues.map((issue, index) => (
                      <article key={`${detailedTag}-${issue.title}-${index}`} className={styles.issueItem}>
                        <p className={styles.issueItemTitle}>{issue.title}</p>
                        <p className={styles.issueItemMeta}>Location: {issue.location || "Unavailable"}</p>
                        {issue.evidence ? (
                          <p className={styles.issueItemEvidence}>Evidence: {issue.evidence}</p>
                        ) : null}
                      </article>
                    ))}
                  </section>
                ))}
              </div>
            ) : (
              <p>No individual issues were extracted from the OCR text.</p>
            )}
          </div>

          <div className={styles.textCard}>
            <h2>Suggested fixes</h2>
            {screenshot.suggestedFixes?.length ? (
              <ul className={styles.fixList}>
                {screenshot.suggestedFixes.map((fix) => (
                  <li key={fix}>{fix}</li>
                ))}
              </ul>
            ) : (
              <p>No resolution guidance is available yet.</p>
            )}
          </div>

          <div className={styles.textCard}>
            <h2>Detected signals</h2>
            {screenshot.matchedSignals?.length ? (
              <div className={styles.signalRow}>
                {screenshot.matchedSignals.map((signal) => (
                  <span key={signal} className={styles.signalPill}>
                    {signal}
                  </span>
                ))}
              </div>
            ) : (
              <p>No strong OCR signals were detected from this screenshot.</p>
            )}
          </div>

          <form className={styles.editCard} onSubmit={handleTagSave}>
            <label>
              <span>Edit tags</span>
              <input
                type="text"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                placeholder="runtime bug 1, authentication bug 1"
              />
            </label>
            <small>Use commas to separate tags. SnapSense will normalize them to lowercase.</small>

            <div className={styles.actions}>
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save tags"}
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? "Deleting..." : "Delete screenshot"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default DetailPage;
