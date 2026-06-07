// backend/utils/responseHandler.js

const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    ...(data !== null && { data })
  });
};

module.exports = { sendResponse };
