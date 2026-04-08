import API from "../api/axios";

export const uploadImage = (file, purpose = "posts") => {
  const formData = new FormData();
  formData.append("image", file);

  return API.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
