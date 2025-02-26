
import { string } from 'prop-types';
import { createClient } from 'redis'




const redisClient = createClient({
    url: 'redis://redis:6379',
})

redisClient.on( 'error', (e) => {
    console.log('error connecting to redis: \n', e)
})

export async function connectToRedis() {

    const maxAttempts = 10;
    const delay = 300;

    let attempt = 0;

    while (attempt<maxAttempts) {
        try {
        
            await redisClient.connect();
            console.log("redis connected successfully")
            break;
        } catch (e) {
            attempt++
            await new Promise( resolve => setTimeout( resolve, delay))
        }
    }
    if ( attempt === maxAttempts) {
        console.log(`redis failed after ${maxAttempts}`)
    }
}

export async function createSession( key: string, value: string) {
    await redisClient.set( key, value)
}

export async function deleteSession( key: string) {
    await redisClient.del( key)
}

export async function getSession( key: string): Promise<string> {
    const v =  await redisClient.get( key)
    if (!v) return ""
    return v
}