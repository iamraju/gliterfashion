import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, upload.single('upload'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: { message: 'No file uploaded' } });
    }

    // Return format compatible with CKEditor (and general use)
    // CKEditor Simple Upload Adapter expects { url: '...' } or { urls: { ... } }
    // Or we can just return { url: ... } and handle adapter on client
    const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
        url: fullUrl,
        uploaded: 1, // CKEditor legacy support
        fileName: req.file.filename
    });
});

export default router;
