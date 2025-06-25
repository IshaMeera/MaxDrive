import React from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const FolderDialog = ({ folderName, setFolderName, onCreate, open, setOpen,
                        showDuplicateDialog, setShowDuplicateDialog
 }) =>{
    return(
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='sm:max-w-md'>
             <DialogHeader>
                <DialogTitle>Create new folder</DialogTitle>
             </DialogHeader>

        <Input 
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder='Enter folder name'
        />

        <DialogFooter className='mt-4'>
            <DialogClose asChild>
                <Button varient='outline'>Cancel</Button>
            </DialogClose>
            <Button
              onClick={()=>{
                onCreate();
                setOpen(false);
              }}>
                Create
            </Button>
        </DialogFooter>
        </DialogContent>
        </Dialog>
              
        <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Folder already exists</DialogTitle>
                </DialogHeader>
              <p className='text-sm text-muted-foreground'>
                A folder with this name already exists. Please try a different name.
              </p>
              <DialogFooter className='mt-4'>
                <Button onClick={()=> setShowDuplicateDialog(false)} className='w-full'>
                    OK
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>
        </>     
    )
}
export default FolderDialog;