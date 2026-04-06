import {createClient} from "redis";

const redisclient = createClient({
    url:"redis://default:WJXTednZ61JkZoMPbtLs6KS8Qd5LYLEe@redis-11897.crce179.ap-south-1-1.ec2.cloud.redislabs.com:11897",
    socket: {
        host: 'redis-11897.crce179.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 11897
    }
});

// client.on('error', err => console.log('Redis Client Error', err));


export default redisclient