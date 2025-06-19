import express from 'express';
import Folder from '../../models/folder.mjs';

const router = express.Router();

router.get('/', async(req, res)=>{
    try{
        const folders = await Folder.find().sort({createdAt: -1});
        res.json(folders);
    }catch(err){
        res.status(500).json({err: 'Failed to fetch folders'});
    }
})

router.post('/', async(req, res)=>{
    try{
        const {name} = req.body;

        if(!name || name.trim()===''){
            return res.status(400).json({error: 'Folder name is required'});
        }

        const folder = new Folder({name: name.trim() });
        await folder.save();
        res.status(201).json(folder);
    }catch(err){
        res.status(500).json({err: 'Failed to create folder'});
    }
})

export default router;