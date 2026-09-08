const Redis = require('ioredis').default

const redis = new Redis(process.env.REDIS_URL);
//     {
//     host:process.env.REDIS_HOST,
//     port:process.env.REDIS_PORT,
//     password:process.env.REDIS_PASSWORD
// })

console.log("REDIS_URL:", process.env.REDIS_URL)

redis.on("connect",()=>{
    console.log("server connected to Redis");
})

redis.on("error",(err)=>{
    console.log(err)
})

module.exports = redis