import redisclient from "./Redis.js";

const Ratelimiter = async (req,res,next)=>{
    try {

        const ip = req.ip;
        //console.log(ip)

        const count = await redisclient.incr(ip);
        if (count === 1) {
         await redisclient.expire(key, 3600);
        }

        if(count>50){
            return res.status(429).json(
                {
                    message:"User Limit exceeded"
                }
            )
        }
       next();

    } catch (error) {
        console.log(`unablE to run RATRLIMITER`, error.message)
        return res.status(500).json({
            message:"Unable to execute rate limiter"
        })
    }
}

export  {Ratelimiter}