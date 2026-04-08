import { useCallback, useReducer } from "react";
import {
  toggleLike,
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../services/postInteraction.service";
import { useLikedPosts } from "./useLikedPosts";

const initialState = {
  commentInputByPostId: {},
  commentsByPostId: {},
  activeCommentPostId: null,
  isUpdatingComment: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_COMMENT_INPUTS":
      return {
        ...state,
        commentInputByPostId: action.payload,
      };
    case "SET_COMMENT_INPUT":
      return {
        ...state,
        commentInputByPostId: {
          ...state.commentInputByPostId,
          [action.postId]: action.value,
        },
      };
    case "SET_COMMENTS":
      return {
        ...state,
        commentsByPostId: {
          ...state.commentsByPostId,
          [action.postId]: action.comments,
        },
      };
    case "PREPEND_COMMENT":
      return {
        ...state,
        commentsByPostId: {
          ...state.commentsByPostId,
          [action.postId]: [
            action.comment,
            ...(state.commentsByPostId[action.postId] || []),
          ],
        },
      };
    case "UPDATE_COMMENT":
      return {
        ...state,
        commentsByPostId: {
          ...state.commentsByPostId,
          [action.postId]: (state.commentsByPostId[action.postId] || []).map(
            (c) => (c._id === action.commentId ? action.comment : c),
          ),
        },
      };
    case "REMOVE_COMMENT":
      return {
        ...state,
        commentsByPostId: {
          ...state.commentsByPostId,
          [action.postId]: (state.commentsByPostId[action.postId] || []).filter(
            (c) => c._id !== action.commentId,
          ),
        },
      };
    case "SET_ACTIVE_COMMENT_POST_ID":
      return { ...state, activeCommentPostId: action.postId };
    case "SET_IS_UPDATING_COMMENT":
      return { ...state, isUpdatingComment: action.value };
    default:
      return state;
  }
};

export const usePostInteractions = ({ setPosts }) => {
  const { likedPosts, setLikedPosts, refreshLikedPosts } = useLikedPosts();
  const [state, dispatch] = useReducer(reducer, initialState);

  const setCommentInputs = useCallback(
    (nextCommentInputsOrUpdater) => {
      const nextCommentInputs =
        typeof nextCommentInputsOrUpdater === "function"
          ? nextCommentInputsOrUpdater(state.commentInputByPostId)
          : nextCommentInputsOrUpdater;

      dispatch({ type: "SET_COMMENT_INPUTS", payload: nextCommentInputs });
    },
    [state.commentInputByPostId],
  );

  const setCommentInput = useCallback((postId, value) => {
    dispatch({ type: "SET_COMMENT_INPUT", postId, value });
  }, []);

  const setActiveCommentPostId = useCallback((postId) => {
    dispatch({ type: "SET_ACTIVE_COMMENT_POST_ID", postId });
  }, []);

  const handleLike = useCallback(
    async (postId) => {
      try {
        const response = await toggleLike(postId);
        if (response.data?.success) {
          setPosts((prevPosts) =>
            prevPosts.map((p) => {
              if (p._id === postId) {
                return {
                  ...p,
                  reactionCount: response.data.isReacted
                    ? p.reactionCount + 1
                    : Math.max(0, p.reactionCount - 1),
                };
              }
              return p;
            }),
          );
          setLikedPosts((prevLikedPosts) => ({
            ...prevLikedPosts,
            [postId]: response.data.isReacted,
          }));
        }
      } catch (error) {
        console.error("Like error", error);
      }
    },
    [setLikedPosts, setPosts],
  );

  const handleComment = useCallback(
    async (postId) => {
      const text = state.commentInputByPostId[postId];
      if (!text?.trim()) return;

      try {
        const response = await addComment(postId, text);
        if (response.data?.success) {
          const newComment = response.data.data;

          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p,
            ),
          );

          dispatch({ type: "PREPEND_COMMENT", postId, comment: newComment });
          dispatch({ type: "SET_ACTIVE_COMMENT_POST_ID", postId });
          dispatch({ type: "SET_COMMENT_INPUT", postId, value: "" });
        }
      } catch (error) {
        console.error("Comment error", error);
        alert("Không thể gửi bình luận lúc này.");
      }
    },
    [setPosts, state.commentInputByPostId],
  );

  const openCommentModal = useCallback(async (postId) => {
    dispatch({ type: "SET_ACTIVE_COMMENT_POST_ID", postId });
    try {
      const response = await getComments(postId);
      if (response.data?.success) {
        dispatch({
          type: "SET_COMMENTS",
          postId,
          comments: response.data.data,
        });
      }
    } catch (error) {
      console.error("Lỗi lấy bình luận:", error);
    }
  }, []);

  const handleUpdateComment = useCallback(
    async (postId, commentId, content, onSuccess) => {
      if (!content?.trim()) {
        alert("Nội dung không được để trống");
        return;
      }

      dispatch({ type: "SET_IS_UPDATING_COMMENT", value: true });
      try {
        const response = await updateComment(postId, commentId, content);
        if (response.data?.success) {
          const updatedComment = response.data.data;
          dispatch({
            type: "UPDATE_COMMENT",
            postId,
            commentId,
            comment: updatedComment,
          });

          if (typeof onSuccess === "function") {
            onSuccess(updatedComment);
          }
        }
      } catch (error) {
        alert(
          "Sửa bình luận thất bại: " + (error.response?.data?.message || ""),
        );
      } finally {
        dispatch({ type: "SET_IS_UPDATING_COMMENT", value: false });
      }
    },
    [],
  );

  const handleDeleteComment = useCallback(
    async (postId, commentId) => {
      if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
        return;
      }

      try {
        const response = await deleteComment(postId, commentId);
        if (response.data?.success) {
          dispatch({ type: "REMOVE_COMMENT", postId, commentId });
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p._id === postId
                ? { ...p, commentCount: Math.max(0, p.commentCount - 1) }
                : p,
            ),
          );
        }
      } catch (error) {
        alert("Xóa bình luận thất bại!");
      }
    },
    [setPosts],
  );

  return {
    likedPosts,
    refreshLikedPosts,
    handleLike,
    commentInputs: state.commentInputByPostId,
    setCommentInputs,
    setCommentInput,
    postComments: state.commentsByPostId,
    activeCommentPostId: state.activeCommentPostId,
    setActiveCommentPostId,
    openCommentModal,
    handleComment,
    handleUpdateComment,
    handleDeleteComment,
    isUpdatingComment: state.isUpdatingComment,
  };
};
