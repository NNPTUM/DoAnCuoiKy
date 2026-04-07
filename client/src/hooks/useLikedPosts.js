import { useCallback, useReducer } from "react";
import { getMyLikedPostIds } from "../services/postInteraction.service";
import { toLikedMap } from "../utils/postReaction";

const likedPostsReducer = (state, action) => {
  switch (action.type) {
    case "SET_ALL":
      return toLikedMap(action.payload);
    case "SET_MAP":
      return action.payload;
    default:
      return state;
  }
};

export const useLikedPosts = () => {
  const [likedPosts, dispatch] = useReducer(likedPostsReducer, {});

  const setLikedPosts = useCallback(
    (nextStateOrUpdater) => {
      dispatch({
        type: "SET_MAP",
        payload:
          typeof nextStateOrUpdater === "function"
            ? nextStateOrUpdater(likedPosts)
            : nextStateOrUpdater,
      });
    },
    [likedPosts],
  );

  const refreshLikedPosts = useCallback(async () => {
    try {
      const reactionsRes = await getMyLikedPostIds();
      if (reactionsRes.data?.success) {
        dispatch({ type: "SET_ALL", payload: reactionsRes.data.data });
      }
    } catch (error) {
      console.error("Lỗi tải danh sách bài đã thích:", error);
    }
  }, []);

  return {
    likedPosts,
    setLikedPosts,
    refreshLikedPosts,
  };
};
