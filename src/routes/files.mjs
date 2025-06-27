import express from "express";
import File from "../../models/file.mjs"; 
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
const uploadDir = path.resolve('../uploads');

//Get all files
router.get('/', async (req,res)=>{
    try {
    const { type, starred, trash } = req.query;
    console.log('Incoming request:', req.url);
    
    let query = {};
    //applying filter based on the query parameter
    if (type) query.folder = type;
    if (starred === 'true') query.isStarred = true;
    if (trash === 'true') query.isTrashed = true;

    // Fallback: If no filters, return all non-deleted files
    if (!type && !starred && !trash) {
      query.isTrashed = { $ne: true };  // Optional: Exclude trashed files by default
    }
    console.log("Query built for Mongo:", JSON.stringify(query, null, 2));
    console.log({ query, reqQuery: req.query });


    const files = await File.find(query);
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET files with optional filters
router.get("/", async(req, res)=>{
    const {starred, trashed} = req.query;

    let filter = {};
    if(starred === 'true') filter.isStarred = true;
    if(trashed === 'true') filter.isTrashed = true;

    const files = await File.find(filter);
    res.json(files);
});

// PATCH to toggle star
router.patch("/:id/star", async(req, res)=>{
    const file = await File.findById(req.params.id);
    if(!file) return res.status(404).json({error: "Not found"});

    file.isStarred = !file.isStarred;
    await file.save();
    res.json({message: 'Star toggled', file});
});

//PATCH to move to trash 
router.patch('/:id/trash', async(req, res)=>{
    try{
      const {id} = req.params;
      const file = await File.  findById(id);;
      if(!file) return res.status(404).json({error: 'File not found'});

      file.previousFolder = file.folder;
      file.isTrashed = true;
      file.folder = 'trash';

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
    const fileId = req.params.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    let folderName = file.folder;

    if (!folderName) {
      const ext = path.extname(file.filename).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
        folderName = 'images';
      } else if (['.pdf'].includes(ext)) {
        folderName = 'pdf';
      } else if (['.csv'].includes(ext)) {
        folderName = 'csv';
      } else if (['.xlsx', '.xls'].includes(ext)) {
        folderName = 'excel';
      } else if (['.mp4', '.avi', '.mov'].includes(ext)) {
        folderName = 'videos';
      } else if (['.zip', '.rar'].includes(ext)) {
        folderName = 'zips';
      } else {
        folderName = 'others';
      }
    }
    console.log('file.folder', file.folder);
    console.log('file.filename', file.filename);


    const oldPath = path.join(uploadDir, file.folder, file.filename);
    const newPath = path.join(uploadDir, file.folder, newName);
    console.log('Old path:', oldPath);
    console.log('New path:', newPath);
    console.log('Final folder path:', folderName);

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
      const {id} = req.params;
      const file = await File.findById(id);
      if(!file) return res.status(404).json({error: 'File not found'});

      file.isTrashed = false;
      //restore to previous folder if available
      file.folder = file.previousFolder || 'all'; // Default to 'all' if no previous folder
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
      const {id} = req.params;
      const file = await File.findByIdAndDelete(id);

      if(!file) return res.status(404).json({error: 'File not found'});
      const filePath = `${uploadDir}/${file.folder}/${file.filename}`;
      await fs.unlink(filePath).catch(()=>{
        console.warn('File not found on disk: ${filePath}')
      });
      res.json({message: 'File deleted permanently', file});
    }catch(err){
      console.error('Error deleting file:', err);
      res.status(500).json({error: 'Failed to dlt file permanently'});
    }
})

export default router;