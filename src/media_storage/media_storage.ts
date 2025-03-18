import { Client } from "cassandra-driver";
import dbClient from "../database/client";
import { minioClient } from "./client";
import { v4 as uuidv4 } from "uuid"
import imageType from "image-type";


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

        const avatarId = "/" + userId + "/" + uuidv4() + "." + ext
        console.log("storing image with id: ", avatarId)
        // WE CAN USE THE ITAG AFTER TO VALIDATE THE DATA INTEGRITY
        await minioClient.putObject( "images", avatarId, avatar, avatar.length)
    

        const query = `
            UPDATE avatars SET avatar=? WHERE id=?
        `;

        await dbClient.execute(query, [
            avatarId,
            userId
        ], { prepare: true });

    }

    // managing images storage
    static async storeImage( prefix: string, imageData :Buffer): Promise<string> {

        const type = await imageType( imageData)

        if (!type) throw new Error("no type found")

        const imageId = prefix + uuidv4() + type.ext
        console.log("storing image with id: ", imageId)
        // WE CAN USE THE ITAG AFTER TO VALIDATE THE DATA INTEGRITY
        await minioClient.putObject( "images", imageId, imageData, imageData.length)
        
        return imageId
    }

    static async getAvatar( imageId: string): Promise<string> {
        const url = await minioClient.presignedGetObject( "images", imageId, 604800) // url valid for 7d
        console.log("download url: ", url)
        return url
    }

    static async getImage( imageId: string): Promise<string> {
        const url = await minioClient.presignedGetObject( "images", imageId, 3600) // url valid for 7d
        console.log("download url: ", url)
        return url
    }

};










