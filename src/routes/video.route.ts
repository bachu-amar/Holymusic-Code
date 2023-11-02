import {videoByIDPlay} from "@/controllers/video.controller";
import express from "express";
import multer from "multer";
import {uploadVideo} from "@/controllers/video.controller";
const router = express.Router();

// const storage = multer.memoryStorage();
// const uploadvideo = multer({ storage });
// router.post("/uploadvideo", uploadvideo.single("file") ,uploadVideo);


// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define the endpoint for uploading a video and creating video details
router.post('/upload-video', upload.single('file'), uploadVideo);



router.get('/videoplay/:id',videoByIDPlay)  

export default router;