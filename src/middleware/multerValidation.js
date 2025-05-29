// handleMulterErrors.js
const multer = require("multer");
const upload = require("./uploadFile");

const handleMulterErrors = (req, res, next) => {
  const uploader = upload.array("propertyImages", 5); // max 5 files

  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ status: "error", message: "File size exceeds 20MB" });
      }
    } else if (err) {
      if (err.name === "INVALID_FILE_TYPE") {
        return res.status(400).json({ status: "error", message: err.message });
      }

      return res.status(400).json({
        status: "error",
        message: `Upload error: ${err.message}`,
      });
    }

    next();
  });
};

module.exports = handleMulterErrors;
