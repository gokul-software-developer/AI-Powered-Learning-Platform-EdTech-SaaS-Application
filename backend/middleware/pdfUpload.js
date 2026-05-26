const multer = require('multer');
const path = require('path');

// Configure Storage (optional: can skip destination if you're handling it elsewhere)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/pdfs/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// File Filter: Only PDFs allowed
const pdfFileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  if (file.mimetype === 'application/pdf' && fileExt === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const uploadPDF = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max file size
  },
});

module.exports = uploadPDF;
