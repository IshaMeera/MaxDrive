import { BASE_URL } from "@/lib/config";
import React from "react";
import { FaDownload, FaEnvelope, FaLink, FaWhatsapp } from "react-icons/fa";

export default function ShareModel({file, onClose}){
    const fileUrl = file.url;

    const handleCopyLink = async() =>{
        try{
            await navigator.clipboard.writeText(fileUrl);
            alert('Link copied to clipboard!');
        }catch(err){
            console.error('Failed to copy:', err);
        }
    };
    const handleWhatsAppShare = () =>{
        const url = `https://wa.me/?text=Check out this file: ${encodeURIComponent(fileUrl)}`;
        window.open(url, "_blank");
    };
    const handleShareEmail = () =>{
        const subject = 'Check out this file';
        const body = `Here's the file link: ${fileUrl}`;
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(url, "_black")
    };
    const handleDownload = () =>{
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", file.filename);
        window.open(`${BASE_URL}/download/${file.physicalFolder}/${file.filename}`, "_blank");
    };
    return(
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-xl">
                <button onClick={onClose} className="absolute top-3 right-4 text-xl">&times;</button>
                <h2 className="text-xl font-bold mb-4">Share "{file.filename}"</h2>
                <div className="flex gap-4 justify-center">
                 <button onClick={handleCopyLink}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                    <FaLink />
                 </button>
                 <button onClick={handleWhatsAppShare}
                 className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded">
                    <FaWhatsapp /> 
                 </button>
                 <button onClick={handleShareEmail}
                 className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded">
                    <FaEnvelope />
                 </button>
                 <button onClick={handleDownload}
                 className="flex items-center gap-2 bg-pink-600 text-white hover:bg-pink-700 px-4 py-2 rounded">
                    <FaDownload />
                 </button>
                </div>

            </div>

        </div>
    )
}