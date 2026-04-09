import { useEffect, useState } from "react";

import { getScreenshotImageBlob } from "../services/screenshotService.js";

const ProtectedImage = ({ screenshotId, alt, className, fallbackClassName }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    let isMounted = true;
    let objectUrl = "";

    const loadImage = async () => {
      try {
        const blob = await getScreenshotImageBlob(screenshotId);
        objectUrl = URL.createObjectURL(blob);

        if (isMounted) {
          setImageUrl(objectUrl);
        }
      } catch (_error) {
        if (isMounted) {
          setImageUrl("");
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [screenshotId]);

  if (!imageUrl) {
    return <div className={fallbackClassName || className} aria-label={alt} />;
  }

  return <img src={imageUrl} alt={alt} className={className} />;
};

export default ProtectedImage;
