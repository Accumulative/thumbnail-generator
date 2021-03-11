import multer from 'multer';
import { PostFileRequest } from './types';

// file middleware
const fileMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: PostFileRequest, file, cb) => {
    // basic file validation
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      req.fileValidationError =
        'Please supply an image with the .png, .jpg or .jpeg extension';
    }
  }
}).single('file');

export { fileMiddleware };
