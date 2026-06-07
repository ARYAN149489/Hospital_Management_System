// backend/middleware/upload.middleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/profiles',
    'uploads/medical-records',
    'uploads/prescriptions',
    'uploads/lab-reports',
    'uploads/documents'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';

    // Determine upload path based on fieldname
    if (file.fieldname === 'profileImage' || file.fieldname === 'profilePicture') {
      uploadPath = 'uploads/profiles/';
    } else if (file.fieldname === 'medicalRecord') {
      uploadPath = 'uploads/medical-records/';
    } else if (file.fieldname === 'prescription') {
      uploadPath = 'uploads/prescriptions/';
    } else if (file.fieldname === 'labReport') {
      uploadPath = 'uploads/lab-reports/';
    } else if (file.fieldname === 'document') {
      uploadPath = 'uploads/documents/';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx|txt/;
  const allowedMedicalTypes = /jpeg|jpg|png|pdf|dicom/;

  const ext = path.extname(file.originalname).toLowerCase();
  const extname = ext.slice(1); // Remove the dot

  // Check based on field name
  if (file.fieldname === 'profileImage' || file.fieldname === 'profilePicture') {
    if (allowedImageTypes.test(extname)) {
      return cb(null, true);
    }
    return cb(new Error('Only image files are allowed for profile pictures (jpeg, jpg, png, gif, webp)'));
  }

  if (file.fieldname === 'medicalRecord' || file.fieldname === 'labReport') {
    if (allowedMedicalTypes.test(extname)) {
      return cb(null, true);
    }
    return cb(new Error('Only medical files are allowed (jpeg, jpg, png, pdf, dicom)'));
  }

  if (file.fieldname === 'prescription' || file.fieldname === 'document') {
    if (allowedDocTypes.test(extname) || allowedImageTypes.test(extname)) {
      return cb(null, true);
    }
    return cb(new Error('Only documents and images are allowed (pdf, doc, docx, jpeg, jpg, png)'));
  }

  // Default: allow common file types
  if (allowedImageTypes.test(extname) || allowedDocTypes.test(extname)) {
    return cb(null, true);
  }

  cb(new Error('Invalid file type'));
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'One or more files are too large. Maximum size is 10MB per file'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum is ${maxCount} files`
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Middleware for multiple fields
const uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fields);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'One or more files are too large. Maximum size is 10MB per file'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Delete file utility
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Get file extension
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Check if file is image
const isImageFile = (filename) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

// Check if file is PDF
const isPDFFile = (filename) => {
  return getFileExtension(filename) === '.pdf';
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  getFileExtension,
  isImageFile,
  isPDFFile
};