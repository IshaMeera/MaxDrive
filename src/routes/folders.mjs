import express from 'express';
import Folder from '../../models/folder.mjs';

const router = express.Router();

router.get('/', async(req, res)=>{
    try{
        console.log('Incoming req:', req.url);

        if(!req.session.created){
            req.session.created = true;
            console.log('Session initialized:', req.sessionID);
        }

        const folders = await Folder.find({sessionID: req.sessionID}).sort({createdAt: -1});
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
        const exists = await Folder.findOne({name: {$regex: `^${name}`, $options: 'i'},
                                    sessionID: req.sessionID});
        if(exists){
            return res.status(409).json({message: 'Folder already exists'});
        }

        const folder = new Folder({
            name: name.trim(),
            sessionID: req.sessionID,
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