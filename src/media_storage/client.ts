import * as Minio from 'minio'

export const minioClient = new Minio.Client({
  endPoint: 'schat-minio',
  port: 9000,
  useSSL: false,
  accessKey: 'schat-app',
  secretKey: 'schat-app',
})




export async function createStorageBuckets() {

    // we don't need to take performance into account that much here
    const exists = await minioClient.bucketExists( "images")
    if ( !exists) {
        await minioClient.makeBucket( "images")
    }
    console.log( "images bucket was created")
}