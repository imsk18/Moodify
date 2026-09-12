import { useContext } from "react";
import { SongContext } from "../Song.context";

const useSong = ()=>{
    const context = useContext(SongContext);
    if (!context) throw new Error("useSong must be used inside SongContextProvider");
    return context;
}

export default useSong;