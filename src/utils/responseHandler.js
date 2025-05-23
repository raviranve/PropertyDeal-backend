exports.success = (res, data, message = "Success", code = 200) => {
  res.status(code).json({ success: true, message, data });
};

exports.error = (res, error, code = 500) => {
  res.status(code).json({ success: false, message: error.message || "Server Error" });
};