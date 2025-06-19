import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true, //autogenerate createdAt and updatedAt
    }
);

const folder = mongoose.model('Folder', folderSchema);
export default folder;