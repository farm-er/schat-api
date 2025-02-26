import {hash as argonhash, argon2id, verify} from "argon2"







export async function hash( password: string, saltRounds: number): Promise<string> {
    try {
        const options = {
            type: argon2id,  // Use argon2id (recommended)
            timeCost: 3,            // 3 iterations (similar to salt rounds in bcrypt)
            memoryCost: 2 ** 16,    // 64MB of memory (you can increase this for more security)
            parallelism: 1,         // Use 1 thread
        };
        const hashedPass : string = await argonhash( password, options)
        return hashedPass
    } catch (e) {
        console.log( "error hashing: ", e)
        throw e
    }
}  



export async function compare( password: string, hashedPass: string): Promise<boolean> {

    try {
        const isMatch = await verify(hashedPass, password);
        return isMatch
    } catch (e) {
        console.log('Error comparing passwords:', e);
        throw e
    }

}


