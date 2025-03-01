import { Client } from "cassandra-driver";
import dbClient from "../database/client";
import Message, { Reply } from "../message/message.model";
import { string } from "prop-types";



export enum userStatus {
  NORMAL='0',
  MUTED='1',
  BLOCKED='2'
}


export async function createChatTable( client: Client) {
  
  const createChatTable = `
    CREATE TABLE IF NOT EXISTS chats (
      id UUID,
      created_at TIMESTAMP,
      user1 frozen<user>,
      user2 frozen<user>,
      last_message frozen<message>,
      PRIMARY KEY (id)
    );
  `;

  const createMessageType = `
    CREATE TYPE IF NOT EXISTS message (
      sent_at TIMESTAMP,
      id timeuuid,
      user_id UUID,
      content TEXT,
      reply frozen<reply>,
      media TEXT
    );
  `

  const createUserType = `
    CREATE TYPE IF NOT EXISTS user (
      id UUID,
      username TEXT,
      status TEXT,
      avatar TEXT
    );
  `

  try {

    await client.execute(createMessageType);
    console.log('Type "message" created successfully!');

    await client.execute(createUserType);
    console.log('Type "user" created successfully!');

    // Execute the query
    await client.execute(createChatTable);
    console.log('Table "chats" created successfully!');

  } catch (err) {
    console.error('Error creating "chats" table or user type:', err);
    process.exit(1)
  }
}

type user = {
  id: string
  username: string
  status: string
  avatar: string | null
}

interface message {
  sentAt: Date
  id: string
  userId: string
  content: string
  reply: Reply | null
  media: string | null
}

export default class Chat {

  createdAt: Date
  id :string;
  user1: user;
  user2: user;
  last_message: message | null;

  constructor( 
    {
      createdAt,
      id,
      user1,
      user2,
      last_message,
    }:{
      createdAt: Date
      id :string;
      user1: user;
      user2: user;
      last_message: message | null;
    }
  )
  {
    this.createdAt = createdAt;
    this.id = id;
    this.user1 = user1;
    this.user2 = user2;
    this.last_message = last_message;
  }

  // needs the object with all the info
  async addChat() {

    const insertQuery = `
      INSERT INTO chats (id, created_at, user1, user2)
      VALUES (?, ?, ?, ?);
    `;

    await dbClient.execute(insertQuery, [
      this.id,
      this.createdAt,
      this.user1,
      this.user2,
    ], { prepare: true });
  
  }

  static async getChat( id: string) : Promise<Chat | null> {
    
    const insertQuery = `
      SELECT * FROM chats
      WHERE id=? LIMIT 1;
    `;

    const result = await dbClient.execute(insertQuery, [
      id
    ], { prepare: true });

    if (result.rowLength === 0) {
      return null
    }
  
    const chat: Chat = new Chat({
        createdAt: result.first().get('createdAt'),
        id: result.first().get('id').toString(),
        user1: result.first().get('user1'),
        user2: result.first().get('user2'),
        last_message: result.first().get('last_message'),
    })

    return chat
  }

  static async updateLastMessage( m: message, chatId: string): Promise<void> {

    const query = `
      update chats SET last_message=? WHERE ?;
    `

    await dbClient.execute( query, [
      m,
      chatId
    ])

  } 

  static async blockChat( id: string, user: user, pos: number) {

    user.status = userStatus.BLOCKED
    
    if (pos === 1) {
      const query = `
        update chats SET user1=? WHERE ?;
      `

      await dbClient.execute( query, [
        user,
        id
      ])
      return
    }

    const query = `
      update chats SET user2=? WHERE ?;
    `

    await dbClient.execute( query, [
      user,
      id
    ])
  }
  
  static async muteChat( id: string, user: user, pos: number) {

    user.status = userStatus.MUTED
    
    if (pos === 1) {
      const query = `
        update chats SET user1=? WHERE ?;
      `

      await dbClient.execute( query, [
        user,
        id
      ])
      return
    }

    const query = `
      update chats SET user2=? WHERE ?;
    `

    await dbClient.execute( query, [
      user,
      id
    ])

  }

  static async normalChat( id: string, user: user, pos: number) {
    
    user.status = userStatus.NORMAL
    
    if (pos === 1) {
      const query = `
        update chats SET user1=? WHERE ?;
      `

      await dbClient.execute( query, [
        user,
        id
      ])
      return
    }

    const query = `
      update chats SET user2=? WHERE ?;
    `

    await dbClient.execute( query, [
      user,
      id
    ])
  }

}





