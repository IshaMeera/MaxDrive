import express from 'express';
import mongoose from 'mongoose';
import Folder from '../../models/folder.mjs';

const router = express.Router();

router.use((req, res, next) => {
    console.log(`Incoming request to folders route: ${req.method} ${req.url}`);
    next();
})

router.get('/', async(req, res)=>{
    try{
        console.log('Incoming req:', req.url);
        console.log("SessionID on request:", req.sessionID);

        let {parent} = req.query;
        let filter = { sessionID: req.sessionID };

        if(parent){
            try{
                filter.parentFolder = new mongoose.Types.ObjectId(parent);
                filter._id = { $ne: parent }; // Exclude the current folder itself
            }catch(err){
                console.error("Invalid parent folder ID[ObjectId]:", err);
                return res.status(400).json({error: 'Invalid parent folder ID'});
            }
        }else{
            filter.parentFolder = null;
        }
        
        const folders = await Folder.find(filter).sort({createdAt: 1});
        console.log("FETCHED FOLDERS:", folders);
        res.json(folders);
    }catch(err){
        res.status(500).json({err: 'Failed to fetch folders'});
    }
})

router.post('/', async(req, res)=>{
    try{
        const {name, parentFolder} = req.body;

        if(!name || name.trim()===''){
            return res.status(400).json({error: 'Folder name is required'});
        }

        let filter = {
            name: {$regex: `^${name}`, $options: 'i'},
            sessionID: req.sessionID,
            parentFolder: parentFolder || null
        }

        const exists = await Folder.findOne(filter);
        if(exists){
            return res.status(409).json({message: 'Folder already exists'});
        }

        const folder = new Folder({
            name: name.trim(),
            sessionID: req.sessionID,
            parentFolder: parentFolder || null,
        });

        await folder.save();
        res.status(201).json(folder);
    }catch(err){
        res.status(500).json({err: 'Failed to create folder'});
    }
})

router.put('/:id', async(req, res)=>{
    const {id} = req.params;
    const {name} = req.body;

    try{
        const exists = await Folder.findOne({name: {$regex: `^${name}$`, $options: 'i'}});
        if(exists && exists._id.toString() != id){
            return res.status(409).json({message: 'Another folder with this name already exists'});
        }
    const updated = await Folder.findByIdAndUpdate(
        id,
        {name},
        {new: true, runValidators: true}
    );
    if(!updated) return res.status(404).json({message: 'Folder not found mate'});
    res.json(updated)
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Rename failed mate'});
    }
})

export default router;