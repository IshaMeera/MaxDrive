import React, {createContext, useContext, useState} from 'react';

const CustomFolderContext = createContext();

export const CustomFolderProvider = ({children}) => {
    const [customFolders, setCustomFolders] = useState([]);

    return(
        <CustomFolderContext.Provider value={{customFolders, setCustomFolders}}>
            {children}
        </CustomFolderContext.Provider>
    )
}

export const useCustomFolders = () => useContext(CustomFolderContext);