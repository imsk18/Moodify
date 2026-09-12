const songsModel = require("../models/songs.model");
const id3 = require("node-id3")
const storageService = require("../service/storage.service");


const uploadSong = async(req,res)=>{
    try{
    // const {title,url,posterUrl} = req.body
    // console.log(req.file);
    const songBuffer = req.file.buffer;
    const{mood} = req.body
    const tags = id3.read(songBuffer);
    // console.log(tags);


    // const songFile = await storageService.uploadFile({
    //     buffer:songBuffer,
    //     filename:tags.title + ".mp3",
    //     folder:"/Moodify/songs"
    // });                                                         //⬆️ its take more time first upload songs then poster

    // const posterFile = await storageService.uploadFile({
    //     buffer:tags.image.imageBuffer,
    //     filename:`${tags.title}.jpeg`,
    //     folder:"/Moodify/posters"
    // });

      /*   its optimize fast */
      const [songFile,posterFile] = await Promise.all([
        
        storageService.uploadFile({
        buffer:songBuffer,
        filename:tags.title + ".mp3",
        folder:"/Moodify/songs"
    }),
    
    storageService.uploadFile({
        buffer:tags.image.imageBuffer,
        filename:`${tags.title}.jpeg`,
        folder:"/Moodify/posters"
    })


    ])

    const song = await songsModel.create({
        title:tags.title,
        url:songFile.url,
        posterUrl:posterFile.url,
        mood
    })

    res.status(201).json({
        message:"song created successfully.",
        song
    })
}catch (error) {
        console.error("Upload song error:", error);

        res.status(500).json({
            message: "Failed to upload song",
            error: error.message
        });
    }


}

// const getSong = async (req,res)=>{
//     const { mood } = req.body

//     const song = await songsModel.findOne({
//         mood
//     })

//     res.status(200).json({
//         message:"song fetched successfully",
//         song
//     })


// }

const getSong = async (req, res) => {
    try {
        // const { mood } = req.params;
        const { mood } = req.query;

        const songs = await songsModel.find({ mood });

        if (!songs.length) {
            return res.status(404).json({
                message: "No songs found for this mood"
            });
        }

        res.status(200).json({
            message: "Songs fetched successfully",
            songs
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch songs",
            error: error.message
        });
    }
};
module.exports = {
    uploadSong,
    getSong
}