import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
    throw new Error('MONGODB_URI is not defined')
}

let client: MongoClient
let db: Db

export async function connectToDatabase() {
    if (db) {
        return { client, db }
    }

    client = new MongoClient(uri)
    await client.connect()
    db = client.db('nostromo')
    
    return { client, db }
}

export async function getDatabase() {
    if (!db) {
        await connectToDatabase()
    }
    return db
}
