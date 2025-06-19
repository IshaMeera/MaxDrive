import express from "express";
import File from "../../models/file.mjs"; 
import path from 'path';

const router = express.Router();

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
    const file = await File.findById(req.params.id);
    if(!file) return res.status(404).json({error: 'Not found'});

    file.isTrashed = true;
    await file.save();
    res.json({message: 'Moved to trash', file});

});

//DETELE the file permanatly

router.delete('/:id', async(req, res)=>{
    const file = await File.findByIdAndDelete(req.params.id);
    if(!file) return res.status(404).json({error: 'Not found'});

    const filePath = path.join("uploads", file.folder, file.filename);
    await fs.unlink(filePath).catch(()=>{});    //ignore the error if already missingg

    res.join({message: "File permanaetly deleted"});
})

export default router;