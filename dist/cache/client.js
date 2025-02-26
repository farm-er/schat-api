import { createClient } from 'redis';
const redisClient = createClient({
    url: 'redis://redis:6379',
});
redisClient.on('error', (e) => {
    console.log('error connecting to redis: \n', e);
});
async function connectToRedis() {
    const maxAttempts = 10;
    const delay = 300;
    let attempt = 0;
    while (attempt < maxAttempts) {
        try {
            await redisClient.connect();
            console.log("redis connected successfully");
            break;
        }
        catch (e) {
            attempt++;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    if (attempt === maxAttempts) {
        console.log(`redis failed after ${maxAttempts}`);
    }
}
connectToRedis().catch(e => {
    console.log(e);
    process.exit(1);
});
export default redisClient;
