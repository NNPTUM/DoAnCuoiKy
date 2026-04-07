import API from "../api/axios";

export const toggleLike = (postId) => {
  return API.post(`/posts/${postId}/react`, {
    targetModel: "Post",
    type: "like",
  });
};

export const getComments = (postId) => {
  return API.get(`/posts/${postId}/comments`);
};

export const addComment = (postId, content) => {
  return API.post(`/posts/${postId}/comments`, { content });
};

export const updateComment = (postId, commentId, content) => {
  return API.put(`/posts/${postId}/comments/${commentId}`, { content });
};

export const deleteComment = (postId, commentId) => {
  return API.delete(`/posts/${postId}/comments/${commentId}`);
};

export const getMyLikedPostIds = () => {
  return API.get("/posts/reactions/my-posts");
};
