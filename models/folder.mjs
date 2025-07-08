import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true,
        },
        sessionID:{
            type: String,
            required: true,
            index: true,
    },
 }, {
        timestamps: true, //autogenerate createdAt and updatedAt
    });

const folder = mongoose.model('Folder', folderSchema);
export default folder;