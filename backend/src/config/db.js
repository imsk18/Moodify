const mongoose = require('mongoose')

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI)
   .then(()=>{
    console.log("connected to DB")
   })
     .catch((error) => {
      console.error("Database connection failed:", error);
    });
}
module.exports = connectToDB