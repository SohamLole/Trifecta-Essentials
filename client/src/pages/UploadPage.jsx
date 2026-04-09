import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "../components/ToastProvider.jsx";
import { uploadScreenshot } from "../services/screenshotService.js";
import styles from "../styles/UploadPage.module.css";

const UploadPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    return () => URL.revokeObjectURL(localPreview);
  }, [file]);

  const helperText = useMemo(() => {
    if (!file) {
      return "Choose a PNG or JPG screenshot up to 5 MB.";
    }

    return `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }, [file]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      setFile(null);
      return;
    }

    const isImage = ["image/png", "image/jpeg", "image/jpg"].includes(nextFile.type);

    if (!isImage) {
      setErrorMessage("Please choose a PNG or JPG image.");
      setFile(null);
      return;
    }

    setErrorMessage("");
    setFile(nextFile);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Select a screenshot before uploading.");
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setErrorMessage("");

    try {
      const response = await uploadScreenshot(file, (progressEvent) => {
        if (!progressEvent.total) {
          return;
        }

        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setUploadProgress(percent);
      });

      showToast("Screenshot uploaded and processed successfully.");
      navigate(`/screenshots/${response.data._id}`);
    } catch (error) {
      const message =
        error.response?.data?.message || "Upload failed. Please try a different screenshot.";
      setErrorMessage(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.copyColumn}>
        <p className={styles.eyebrow}>Fast capture intake</p>
        <h1>Upload a screenshot for OCR and auto-tagging</h1>
        <p>
          SnapSense stores the image locally, extracts any visible text, and classifies the content
          into quick tags like bug, ui, notes, auth, or api.
        </p>
      </div>

      <form className={styles.uploadCard} onSubmit={handleUpload}>
        <label className={styles.fileDropzone}>
          <input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} />
          <span>Click to choose a screenshot</span>
          <small>{helperText}</small>
        </label>

        {previewUrl ? (
          <div className={styles.previewPanel}>
            <img src={previewUrl} alt="Selected screenshot preview" />
          </div>
        ) : null}

        {uploadProgress > 0 && submitting ? (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <span style={{ width: `${uploadProgress}%` }} />
            </div>
            <p>{uploadProgress}% uploaded</p>
          </div>
        ) : null}

        {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}

        <button className={styles.submitButton} disabled={!file || submitting}>
          {submitting ? "Uploading..." : "Upload screenshot"}
        </button>
      </form>
    </section>
  );
};

export default UploadPage;
