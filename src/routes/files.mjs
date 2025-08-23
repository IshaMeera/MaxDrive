import express from "express";
import File from "../../models/file.mjs"; 
import path from 'path';
import fs from 'fs/promises';
import mongoose from "mongoose";

const router = express.Router();
const uploadDir = path.join(process.cwd(),'uploads');

//Get all files
router.get('/', async (req,res)=>{
    
    try {
    console.log('/api/files endpoint hit');
    console.log('Incoming request:', req.query);

    const { type, starred, trash, folder, customFolder } = req.query;

    let filter = { sessionID: req.sessionID};

    if(customFolder){
      try{
        filter.customFolder = new mongoose.Types.ObjectId(customFolder);
      }catch(err){
        console.error('Invalid customFolder ID:', customFolder, err);
        return res.status(400).json({error: 'Invalid customFolder ID'});
      }
    }else{
      filter.customFolder = null;
    }
    if(folder){
     try{
      filter.folder = new mongoose.Types.ObjectId(folder);
     }catch(err){
      console.error('Invalid folder ID:', folder, err);
      return res.status(400).json({error: 'Invalid folder ID'});
     }
    }else{
      filter.folder = null;
    }

    //root files
    if(!folder && !customFolder){
      filter.customFolder = null;
      filter.folder = null;
    }
    //applying filter based on the query parameter
    if (type) filter.physicalFolder = String(type).toLowerCase();
    if (starred === 'true') filter.isStarred = true;
    if (trash === 'true') {
      filter.isTrashed = true;
    }else{
      filter.isTrashed = { $ne: true }; // Exclude trashed files by default
    }

    console.log("Final mongo filter:", filter);

    const files = await File.find(filter).sort({uploadDate: -1});
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH to toggle star
router.patch("/:id/star", async(req, res)=>{
  try{
    const file = await File.findOne({
      _id: req.params.id,
      sessionID: req.sessionID
    });
    
    if(!file) return res.status(404).json({error: "Not found"});

    file.isStarred = !file.isStarred;
    await file.save();
    res.json({message: 'Star toggled', file});
}catch(err){
  console.error('Error toggling star:', err);
  res.status(500).json({error: "Internal server error"})
}
});

//PATCH to move to trash 
router.patch('/:id/trash', async(req, res)=>{
    try{
      const file = await File.findOne({
        _id: req.params.id,
        sessionID: req.sessionID
      })
      if(!file) return res.status(404).json({error: 'File not found'});

      file.isTrashed = true;    
      file.previousFolder = file.physicalFolder;
      file.physicalFolder = 'trash';
      file.folder = null;
      
      await file.save();
      res.json({message: 'File trashed successfully', file});
    }catch(err){
      console.error('Error trashing file:', err);
      res.status(500).json({error: 'Failed to trash file'});
    }
});

//PATCH to rename a file
router.patch('/:id/rename', async(req, res)=>{
  try{
    const {newName} = req.body;
    
    const file = await File.findOne({
       _id: req.params.id,
        sessionID: req.sessionID
    });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    let folderName = file.physicalFolder;
    console.log('Renaming inside folder:', folderName);
    console.log('file.filename:', file.filename);

    const oldPath = path.join(process.cwd(),'uploads', folderName, file.filename);
    const newPath = path.join(process.cwd(),'uploads', folderName, newName);
    console.log('process.cwd():', process.cwd());
    console.log('uploadDir:', uploadDir);
    console.log('Old path:', oldPath);
    console.log('New path:', newPath);

    await fs.rename(oldPath, newPath);

    file.filename = newName;
    await file.save();

    res.status(200).json({ message: 'File renamed successfully', updatedFile: file });
  } catch (err) {
    console.error('Error renaming file:', err);
    res.status(500).json({ message: 'sadly failed to rename file' });
  }
});

//PATCH to restore a trashed file
  router.patch('/:id/restore', async(req, res)=>{
    try{
      const file = await File.findOne({
        _id: req.params.id,
        sessionID: req.sessionID
      });
      if(!file) return res.status(404).json({error: 'File not found'});

      file.isTrashed = false;
      //restore to previous folder if available
      if(file.previousFolder){
      file.physicalFolder = file.previousFolder;
      }
      file.folder = file.previousFolder || null;
      file.previousFolder = undefined;
      
      await file.save();

      res.json({message: 'File restored successfully', file});
  }catch (err){
    console.error('Error restoring file:', err);
    res.status(500).json({error: 'Failed to restore file'});
  }
});

router.delete('/:id', async(req, res)=>{
    try{
      const file = await File.findByIdAndDelete({
         _id: req.params.id,
        sessionID: req.sessionID
      });

      if(!file) return res.status(404).json({error: 'File not found'});
      const filePath = path.join(uploadDir, file.physicalFolder, file.filename);
      await fs.unlink(filePath).catch(()=>{
        console.warn(`File not found on disk: ${filePath}`)
      });
      res.json({message: 'File deleted permanently', file});
    }catch(err){
      console.error('Error deleting file:', err);
      res.status(500).json({error: 'Failed to dlt file permanently'});
    }
})

export default router;