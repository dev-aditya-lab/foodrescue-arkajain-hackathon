import multer from "multer";

const storage = multer.memoryStorage();

function imageFileFilter(req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new Error("Only image files are allowed"));
}

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    files: 1,
  },
});

export default upload;
