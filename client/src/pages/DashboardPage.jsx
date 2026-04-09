import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";
import Pagination from "../components/Pagination.jsx";
import ScreenshotCard from "../components/ScreenshotCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import {
  getScreenshots,
  searchScreenshots
} from "../services/screenshotService.js";
import styles from "../styles/DashboardPage.module.css";

const DashboardPage = () => {
  const { showToast } = useToast();
  const [screenshots, setScreenshots] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }));
  }, [debouncedSearch, selectedTag, sortBy, sortOrder]);

  useEffect(() => {
    const fetchScreenshots = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const request = debouncedSearch
          ? searchScreenshots({
              query: debouncedSearch,
              page: pagination.page,
              tag: selectedTag || undefined,
              sortBy,
              sortOrder
            })
          : getScreenshots({
              page: pagination.page,
              tag: selectedTag || undefined,
              sortBy,
              sortOrder
            });

        const response = await request;

        setScreenshots(response.data);
        setPagination(response.pagination);
      } catch (error) {
        const message =
          error.response?.data?.message || "Unable to load screenshots right now.";
        setErrorMessage(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchScreenshots();
  }, [debouncedSearch, pagination.page, selectedTag, showToast, sortBy, sortOrder]);

  const availableTags = useMemo(() => {
    const tagSet = new Set();
    screenshots.forEach((screenshot) => {
      screenshot.tags.forEach((tag) => tagSet.add(tag));
      (screenshot.issueTags || []).forEach((tag) => tagSet.add(tag));
      (screenshot.detailedTags || []).forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }, [screenshots]);

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Organize visual clutter</p>
          <h1>Your searchable screenshot workspace</h1>
          <p className={styles.heroCopy}>
            Upload screenshots, let OCR pull out the text, and keep everything discoverable with
            automatic tags.
          </p>
        </div>
        <Link to="/upload" className={styles.primaryAction}>
          Upload screenshot
        </Link>
      </div>

      <div className={styles.toolbar}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        <label className={styles.filter}>
          <span>Filter by tag</span>
          <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)}>
            <option value="">All tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filter}>
          <span>Sort by</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="date">Date</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </label>

        <label className={styles.filter}>
          <span>Order</span>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="desc">{sortBy === "difficulty" ? "Hard to easy" : "Newest first"}</option>
            <option value="asc">{sortBy === "difficulty" ? "Easy to hard" : "Oldest first"}</option>
          </select>
        </label>

        <div className={styles.viewToggle}>
          <button
            type="button"
            className={viewMode === "grid" ? styles.activeToggle : ""}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </button>
          <button
            type="button"
            className={viewMode === "list" ? styles.activeToggle : ""}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
        </div>
      </div>

      {loading ? <Loader label="Loading screenshots..." /> : null}

      {!loading && errorMessage ? (
        <EmptyState
          title="We hit a loading issue"
          description={errorMessage}
          actionLabel="Try uploading a screenshot"
        />
      ) : null}

      {!loading && !errorMessage && !screenshots.length ? (
        <EmptyState
          title="No screenshots found"
          description={
            debouncedSearch || selectedTag
              ? "Try a broader keyword or switch the selected tag filter."
              : "Start by uploading your first screenshot so SnapSense can extract text and organize it."
          }
          actionLabel="Upload screenshot"
        />
      ) : null}

      {!loading && screenshots.length ? (
        <>
          <div className={viewMode === "grid" ? styles.grid : styles.list}>
            {screenshots.map((screenshot) => (
              <ScreenshotCard key={screenshot._id} screenshot={screenshot} viewMode={viewMode} />
            ))}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(nextPage) =>
              setPagination((current) => ({
                ...current,
                page: nextPage
              }))
            }
          />
        </>
      ) : null}
    </section>
  );
};

export default DashboardPage;
