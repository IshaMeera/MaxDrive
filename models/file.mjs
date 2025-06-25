import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    filename:{
        type: String,
        required: true
    },
    uploadDate:{
        type: Date,
        default: Date.now
    },
    size:{
        type: Number
    },
    originalName:{
        type: String
    },
    folder:{
        type: String,
    },
    isTrashed: {type: Boolean, default: false},
    isStarred: {type: Boolean, default: false},
    
    previousFolder:{
        type: String,
    }

});

const File = mongoose.model("File", fileSchema);
export default File;