import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import Searchbar from "@/components/Searchbar";


const Topbar = ({showSearch = false, searchTerm, onSearchChange}) =>{
const navigate = useNavigate();

    return (
        <header className="w-full bg-zinc-950 text-white px-6 py-3 shadow flex items-center justify-between">
            {/* Logo */}
        <div className='font-bold text-ul cursor-pointer' onClick={() => navigate('/')}>
            MaxDrive
        </div>

            {/* Search */}
      {showSearch && (
        <div className="flex-1 px-6">
          <Searchbar value={searchTerm} onChange={onSearchChange}/>
        </div>
      )
      }
          
        
        <div className="flex items-center gap-4">
        {!showSearch && (
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-zinc-300 h seaover:text-white"
          >
            Dashboard
          </Button>
        )}

         <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5" />
        </Button>
        
        <Button variant="outline" className="border-zinc-600 text-black hover:bg-zinc-800">
          {showSearch ? "Sign Out" : "Sign In"}
        </Button>
      </div>

 </header>
    )

}

export default Topbar;