import { Client } from "cassandra-driver";
import dbClient from "../database/client";




export async function createMessageTable( client: Client) {

    const replyType = `
        CREATE TYPE IF NOT EXISTS reply (
            id UUID,
            content TEXT
        );
    `
  
    const createMessageTable = `
        CREATE TABLE IF NOT EXISTS messages (
            sent_at TIMESTAMP,
            chat_id UUID,
            id timeuuid,
            user_id UUID,
            content TEXT,
            reply frozen<reply>,
            media TEXT,
            PRIMARY KEY (chat_id, id)
        ) WITH CLUSTERING ORDER BY (id DESC);
    `;

    try {

        await client.execute(replyType)
        console.log('Type "reply" created successfully')

        await client.execute(createMessageTable)
        console.log('Table "messages" created successfully!')
  
    } catch (err) {
      console.error('Error creating "messages" table:', err)
      process.exit(1)
    }
  }


export interface Reply {
    id: string
    content: string
}

export interface Media {
    id: string
    type: string
}

export default class Message {

    sentAt: Date
    chatId: string
    id: string
    userId: string
    content: string
    reply?: Reply
    media?: Media


    constructor(
        {
            sentAt,
            chatId,
            id,
            userId,
            content,
            reply,
            media
        }: {
            sentAt: Date;
            chatId: string
            id: string
            userId: string
            content: string
            reply?: Reply
            media?: Media
        }
    ) {
        this.sentAt = sentAt
        this.chatId = chatId
        this.id = id
        this.userId = userId
        this.content = content
        this.reply = reply
        this.media = media
    }

    async addMessage() {

        const insertQuery = `
            INSERT INTO messages ( sent_at, chat_id, id, user_id, content, reply, media)
            VALUES (?, ?, now(), ?, ?, ?, ?);
        `;

        const exec = await dbClient.execute(insertQuery, [
            this.sentAt,
            this.chatId,
            this.userId,
            this.content,
            this.reply || null,
            this.media || null
        ], { prepare: true });

    }

    static async getChatMessages( chatId: string): Promise< Message[] | null> {
        
        const insertQuery = `
            SELECT * FROM messages
            WHERE chat_id=?;
        `;

        const result = await dbClient.execute(insertQuery, [
            chatId
        ], { prepare: true });

        if (result.rowLength === 0) {
            return null
        }
        
        const messages: Message[] = result.rows.map( (row) => new Message({
            sentAt: row.get('sent_at'),
            chatId: row.get('chat_id'),
            id: row.get('id'),
            userId: row.get('user_id'),
            content: row.get('content'),
            reply: row.get('reply'),
            media: row.get('media')
        }));

        return messages
    }

    static async deleteMessage( id: string) {
        const Query = `
            DELETE FROM messages WHERE id=?;
        `;

        const exec = await dbClient.execute(Query, [
            id
        ], { prepare: true });

    }
}
  