const { FRIEND_REQUEST_STATUS } = require("./friend-request-status.util");

const resetRequestToPendingAndNotify = async ({
  friendRequest,
  senderId,
  receiverId,
  notifyFn,
}) => {
  friendRequest.status = FRIEND_REQUEST_STATUS.PENDING;
  await friendRequest.save();
  await notifyFn(senderId, receiverId, friendRequest);
  return friendRequest;
};

module.exports = {
  resetRequestToPendingAndNotify,
};
