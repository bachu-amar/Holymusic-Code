import mongoose from "mongoose";
import { bucket } from "@/databases/index";
import Video from "@/models/video.model";
import {VideoUrlBase} from "@/config/index";
import {videoBucket} from "@/databases/index"



const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth() + 1;
const currentDate = date.getDate();
const currentMillis = date.getMilliseconds() + 1;

// Generate a 5-digit random number
const randomNumber = Math.floor(Math.random() * 100000);

// Combine all the values into a single string
const randomValue = `${currentYear}-${currentMonth}-${currentDate}-${currentMillis}-${randomNumber}`;

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded." });
    }

    const name = randomValue + req.file.originalname;
    const buffer = req.file.buffer;

    if (!name.match(/\.(mp4|avi|mkv|mov)$/i)) {
      return res.status(400).json({ error: "Unsupported file format." });
    }

    const start = buffer.indexOf(Buffer.from("mvhd")) + 17;
    const timeScale = buffer.readUInt32BE(start, 4);
    const _d = buffer.readUInt32BE(start + 4, 4);
    const _a = Math.floor((_d / timeScale) * 1000) / 1000;

    const duration = Number(_a);

    if (duration > 15 && duration < 60) {
      const fileUrl = VideoUrlBase + "video/videoByNamePlay/" + name;

      const writeStream = await videoBucket.openUploadStream(name);
  
      writeStream.write(buffer);
      writeStream.end();

      // Create video details and save to the database
      const video = new Video({
        title: req.body.title,
        description: req.body.description,
        videoUrl: fileUrl,
        duration: duration,
      });

      await video.save();

      return res.status(200).json("Video uploaded successfully");
    } else {
      return res.status(400).json("Video duration should be between 15 and 60 seconds.");
    }
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};












export const success = async (req, res) => {
  const {  title, description } = req.body;
  const file =
    VideoUrlBase + "video/videoByNamePlay/" + req.files["file"][0].filename; // Assuming 'file' is the name attribute in your form
  console.log(req.files); // Array
  try {
    const audio = Video.create({
      title,
      description
    });
    (await audio).save();
    return res.status(200).json("Details uploaded successfully");
  } catch (error) {
    return res.status(400).json({ error: "Details not uploaded." });
  }
};




// //  Get Id By Video With Play Video
// export const videoByIDPlay = async (req, res) => {
//     try {
//       const id = req.params.id;
//       if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(400).json({ error: "Invalid song ID format" });
//       }
//       const songStream = bucket.openDownloadStream(
//         new mongoose.Types.ObjectId(id)
//       );
//       res.setHeader("Content-Type", "video/mp4");
//       songStream.pipe(res);
//     } catch (error) {
//       console.error(error); // Log the error for debugging
//       res.status(500).json({ error: "An error occurred while fetching songs." });
//     }
//   };



//  Get Id By Video With Play Video
export const videoByIDPlay = async (req, res) => {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid song ID format" });
      }
      const songStream = bucket.openDownloadStream(
        new mongoose.Types.ObjectId(id)
      );
      res.setHeader("Content-Type", "video/mp4");
      songStream.pipe(res);
      
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "An error occurred while fetching songs." });
    }
  };




// video.controller.ts
// import { Request, Response } from 'express';
// import ytdl from 'ytdl-core';
// import ffmpeg from 'fluent-ffmpeg';
// import { Video } from '@/models/video.model';
// import StatusUpdate from "@/models/status.model";

// export const convertVideoToMP3 = async (req: Request, res: Response) => {
//   try {
//     const { url } = req.body;

//     if (!url) {
//       return res.status(400).json({ error: 'Invalid URL' });
//     }

//     const videoInfo = await ytdl.getInfo(url);
//     const audioStream = ytdl(url, { quality: 'highestaudio' });

//     const outputPath = `output.mp3`;

//     ffmpeg.setFfmpegPath('C:\\Users\\DELL\\Downloads\\ffmpeg-2023-09-07-git-9c9f48e7f2-full_build\\ffmpeg-2023-09-07-git-9c9f48e7f2-full_build\\bin\\ffmpeg.exe');
//     ffmpeg()
//       .input(audioStream)
//       .toFormat('mp3')
//       .save(outputPath)
//       .on('end', () => {
//         res.download(outputPath, (err) => {
//           if (err) {
//             console.error('Error sending the file:', err);
//           } else {
//             console.log('File sent successfully');
//           }
//         });
//       });
//   } catch (error) {
//     console.error('Conversion error:', error);
//     res.status(500).json({ error: 'Conversion failed' });
//   }
// };

 