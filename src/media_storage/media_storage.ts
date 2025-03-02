import { Client } from "cassandra-driver";
import dbClient from "../database/client";
import { minioClient } from "./client";
import { v4 as uuidv4 } from "uuid"


// TODO: change avatar table
// TODO: change storage functions for the avatar in media storage class
// TODO: store avtar link in the database

export async function createAvatarTable( client: Client) {
  
    const createAvatarTable = `
        CREATE TABLE IF NOT EXISTS avatars (
        id UUID,
        avatar TEXT,
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


    static async updateAvatar( avatar: Buffer, userId: string, ext: string) {

        const avatarId = await this.storeImage( userId, avatar, ext)

        const query = `
            UPDATE avatars SET avatar=? WHERE id=?
        `;

        await dbClient.execute(query, [
            avatarId,
            userId
        ], { prepare: true });

    }

    // static async getAvatar( userId: string): Promise<string | null> {
        
    //     const query = 'SELECT avatar FROM avatars WHERE id = ? LIMIT 1';
  
    //     const result = await dbClient.execute(query, [userId], { prepare: true });

    //     if (result.rowLength === 0) {
    //         return null;
    //     }

    //     const avatar: string = result.first().get('avatar')

    //     const avatarUrl = await this.getImage( avatar)

    //     return avatarUrl
    // }

    // managing images storage
    static async storeImage( userId: string, imageData :Buffer, ext: string): Promise<string> {

        const imageId = "/" + userId + "/" + uuidv4() + "." + ext
        console.log("storing image with id: ", imageId)
        // WE CAN USE THE ITAG AFTER TO VALIDATE THE DATA INTEGRITY
        await minioClient.putObject( "images", imageId, imageData, imageData.length)
        
        return imageId
    }

    static async getImage( imageId: string): Promise<string> {
        const url = await minioClient.presignedGetObject( "images", imageId, 604800) // url valid for 7d
        console.log("download url: ", url)
        return url
    }

};










