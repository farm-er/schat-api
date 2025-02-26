import { Client } from "cassandra-driver";
import dbClient from "../database/client";
import { minioClient } from "./client";
import { v4 as uuidv4 } from "uuid"



export async function createAvatarTable( client: Client) {
  
    const createAvatarTable = `
        CREATE TABLE IF NOT EXISTS avatars (
        id UUID,
        avatar BLOB,
        PRIMARY KEY (id)
        );
    `;



    try {
        // Execute the query
        await client.execute(createAvatarTable);
        console.log('Table "avatars" created successfully!');


    } catch (err) {
        console.error('Error creating avatar table:', err);
        throw err
    }
}



// this class is designed to handle all media
// specifically database calls

export default class mediaStorage {


    static async storeAvatar( avatar: Buffer, userId: string) {
        
        const insertQuery = `
            INSERT INTO avatars (id, avatar)
            VALUES (?, ?);
        `;

        await dbClient.execute(insertQuery, [
            userId,
            avatar
        ], { prepare: true });

    }

    static async updateAvatar( avatar: Buffer, userId: string) {

        const query = `
            UPDATE avatars SET avatar=? WHERE id=?
        `;

        await dbClient.execute(query, [
            avatar,
            userId
        ], { prepare: true });

    }

    static async getAvatar( userId: string): Promise<Buffer | undefined> {
        
        const query = 'SELECT avatar FROM avatars WHERE id = ? LIMIT 1';
  
        try {
    
            const result = await dbClient.execute(query, [userId], { prepare: true });
    
            if (result.rowLength === 0) {
                return undefined;
            }

            const avatar: Buffer = result.first().get('avatar')

            return avatar
        } catch(e) {
            throw e
        }
    }

    // managing images storage
    static async storeImage( userId: string, imageData :Buffer, ext: string): Promise<string> {

        const imageId = "/" + userId + "/" + uuidv4() + ext
        console.log("storing image with id: ", imageId)
        // WE CAN USE THE ITAG AFTER TO VALIDATE THE DATA INTEGRITY
        await minioClient.putObject( "images", imageId, imageData, imageData.length)
        
        return imageId
    }

    static async getImage( imageId: string): Promise<string> {
        const url = await minioClient.presignedGetObject( "images", imageId, 60 * 60) // url valid for 1h
        console.log("download url: ", url)
        return url
    }

};










