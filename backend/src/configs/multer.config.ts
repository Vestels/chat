import { diskStorage } from 'multer';
import { extname } from 'path';
import { Logger } from '@nestjs/common';


export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/profile-pictures',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return Logger.error('Only image files are allowed!', false);
    }
    cb(null, true);
  },
};