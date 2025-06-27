import React, { useEffect, useRef } from 'react';
import { useFloating, offset, shift, flip, autoUpdate } from '@floating-ui/react-dom';

const ContextMenu = ({file, x, y, visible, onClose, inTrashView, handleStar, handleTrash, 
    handleRestore, handleDeletePermanent, onRename, filter}) => {
        const menuRef = useRef(null);
        
        const virtualRef = useRef({
            getBoundingClientRect: ()=>({
                x,
                y,
                width: 0,
                height: 0,
                top: y,
                left: x,
                bottom: y,
                right: x,
            })
        })

        const {refs, floatingStyles, update} = useFloating({
            placement: 'right-start',
            middleware: [offset(6), flip(), shift()],
            strategy: 'absolute',
        });

         useEffect(()=>{
            refs.setReference(virtualRef.current);
        }, [x,y,refs]);

//attaching position manually sice v r triggering with coordinates
       useEffect(() => {
        if (visible && refs.floating.current && refs.reference.current) {
            return autoUpdate(refs.reference.current, refs.floating.current, update);
        }
        }, [visible, update]);
//       useEffect(() => {
//   if (visible) {
//     refs.setReference(virtualRef.current);
//     return autoUpdate(virtualRef.current, refs.floating.current, update);
//   }
// }, [x, y, visible, update]);


//close on outside click
        useEffect(() => {
            const handleClickOutside = (e) => {
                if(menuRef.current && !menuRef.current.contains(e.target)){
                    onClose();
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
            return() => document.removeEventListener('mousedown', handleClickOutside);
        }, [onClose]);

        //  useEffect(() => {
        //   console.log("👀 ContextMenu updated:", { visible, file, x, y });
        // }, [visible, file, x, y]);
        //  console.log('ContextMenu props:', {visible, file, x,y});

        // if(!visible || !file){ 
        //     console.log("Menu not rendering: visible =", visible, ", file =", file);
        //     return null;
        // };


        if(!visible || !file) return null;
        return(
        <>
     {visible && file && (
    //  <div
    //     ref={refs.floating}
    //     style={floatingStyles}
    //     className="absolute bg-white z-50 p-2 rounded-xl border shadow-lg w-48 animate-fade-in">
    <div
      ref={(node)=>{
        refs.floating.current = node;
        menuRef.current = node;
      }}
       style={floatingStyles}
       className='absolute bg-white z-50 p-2 rounded-xl border shadow-lg w-48 animate-fade-in'
      >
             
      {inTrashView ? (
        <>
          <p
            onClick={() => {
              handleRestore(file._id);
              onClose();
            }}
            className="text-sm px-3 py-2 hover:bg-blue-100 rounded-sm cursor-pointer transition text-left"
          >
            Restore
          </p>
          <p
            onClick={() => {
              handleDeletePermanent(file._id);
              onClose();
            }}
            className="text-sm px-3 py-2 hover:bg-red-200 rounded-sm cursor-pointer transition text-left"
          >
            Delete Permanently
          </p>
        </>
      ) : (
        <>
          {filter !== 'trashed' && (
            <p
              onClick={() => {
                handleStar(file._id);
                onClose();
              }}
              className="text-sm px-3 py-2 hover:bg-blue-100 rounded-sm cursor-pointer transition text-left"
            >
              {file.isStarred ? 'Unstar' : 'Star'}
            </p>
          )}
          <p
            onClick={() => {
              onRename(file);
              onClose();
            }}
            className="text-sm px-3 py-2 hover:bg-blue-100 rounded-sm cursor-pointer transition text-left"
          >
            Rename
          </p>
          <p
            onClick={() => {
              handleTrash(file._id);
              onClose();
            }}
            className="text-sm px-3 py-2 hover:bg-red-100 rounded-sm cursor-pointer transition text-left"
          >
            Trash
          </p>
        </>
      )}
    </div>
        )}
    </>
        )
    }
    export default ContextMenu;