const findCommentsByPost = async (CommentModel, postId) => {
  return CommentModel.find({ postId })
    .populate("userId", "username avatarUrl")
    .sort({ createdAt: -1 });
};

module.exports = {
  findCommentsByPost,
};
