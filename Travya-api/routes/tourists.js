import { Router } from "express";
import multer from "multer";
import { registerTourist, listTourists, getTouristById } from "../controllers/tourists.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Expect multipart/form-data with files: photo, documentPhoto
router.post(
    "/register",
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "documentPhoto", maxCount: 1 }
    ]),
    registerTourist
);

router.get('/', listTourists);
router.get('/:id', getTouristById);

export default router;


