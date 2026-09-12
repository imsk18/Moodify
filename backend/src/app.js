const express =  require('express')
const cookieParser = require("cookie-parser")
const cors = require("cors");

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true
}));
const authRouter = require('./routes/auth.routes');
const songsRouter = require("./routes/songs.routes");

app.use("/api/auth",authRouter);
app.use("/api/songs",songsRouter);



module.exports = app