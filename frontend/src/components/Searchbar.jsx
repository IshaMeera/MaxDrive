import React from "react";
import {Input} from '@/components/ui/input'

const Searchbar = ({value, onChange, placeholder = "Search"})=>{
    return(
        <div className="w-full px-36">
            <Input 
            type='text'
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className='w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-zinc-700
             focus:outline-none focus:ring-2 focus:ring-blue-500' />
        </div>
    )
}

export default Searchbar;