const FRIEND_REQUEST_STATUS = Object.freeze({
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
});

const FRIEND_REQUEST_STATUS_VALUES = Object.freeze(
  Object.values(FRIEND_REQUEST_STATUS),
);

module.exports = {
  FRIEND_REQUEST_STATUS,
  FRIEND_REQUEST_STATUS_VALUES,
};
