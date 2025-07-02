// updatePhysicalFolders.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Adjust if your File model is somewhere else
import File from "../models/file.mjs";

dotenv.config();

const uri = process.env.MONGODB_URI;  // or your Atlas connection string

async function updatePhysicalFolders() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas");

    const files = await File.find({});
    console.log(`Found ${files.length} files.`);

    let updates = 0;

    for (const file of files) {
      if (!file.physicalFolder) {
        let ext = path.extname(file.filename).toLowerCase();
        let physicalFolder = "";

        if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) {
          physicalFolder = "images";
        } else if ([".pdf"].includes(ext)) {
          physicalFolder = "pdf";
        } else if ([".csv"].includes(ext)) {
          physicalFolder = "csv";
        } else if ([".xlsx", ".xls"].includes(ext)) {
          physicalFolder = "excel";
        } else if ([".mp4", ".avi", ".mov"].includes(ext)) {
          physicalFolder = "videos";
        } else if ([".zip", ".rar"].includes(ext)) {
          physicalFolder = "zips";
        } else {
          physicalFolder = "others";
        }

        file.physicalFolder = physicalFolder;
        await file.save();
        updates++;
        console.log(`Updated file ${file._id} -> ${physicalFolder}`);
      }
    }

    console.log(`Migration complete. Updated ${updates} files.`);
    process.exit(0);
  } catch (err) {
    console.error("Error running migration:", err);
    process.exit(1);
  }
}

updatePhysicalFolders();
