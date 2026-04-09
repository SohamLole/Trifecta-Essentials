import api from "./api.js";

export const getScreenshots = async ({ page = 1, limit = 9, tag, sortBy, sortOrder } = {}) => {
  const response = await api.get("/screenshots", {
    params: {
      page,
      limit,
      tag,
      sortBy,
      sortOrder
    }
  });

  return response.data;
};

export const searchScreenshots = async ({
  query,
  page = 1,
  limit = 9,
  tag,
  sortBy,
  sortOrder
} = {}) => {
  const response = await api.get("/screenshots/search", {
    params: {
      q: query,
      page,
      limit,
      tag,
      sortBy,
      sortOrder
    }
  });

  return response.data;
};

export const getScreenshotById = async (id) => {
  const response = await api.get(`/screenshots/${id}`);
  return response.data;
};

export const getScreenshotImageBlob = async (id) => {
  const response = await api.get(`/screenshots/${id}/image`, {
    responseType: "blob"
  });

  return response.data;
};

export const uploadScreenshot = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("screenshot", file);

  const response = await api.post("/screenshots/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress
  });

  return response.data;
};

export const updateScreenshotTags = async (id, tags) => {
  const response = await api.put(`/screenshots/${id}`, { tags });
  return response.data;
};

export const deleteScreenshot = async (id) => {
  const response = await api.delete(`/screenshots/${id}`);
  return response.data;
};
