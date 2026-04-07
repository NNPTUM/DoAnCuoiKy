export const toLikedMap = (postIds = []) => {
  if (!Array.isArray(postIds)) {
    return {};
  }

  return postIds.reduce((acc, postId) => {
    if (postId !== null && postId !== undefined) {
      acc[String(postId)] = true;
    }
    return acc;
  }, {});
};
