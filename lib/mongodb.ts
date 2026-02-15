import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
    console.error('MONGODB_URI environment variable is not set!')
    throw new Error('MONGODB_URI is not defined in environment variables')
}

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToDatabase() {
    try {
        if (db) {
            return { client, db }
        }

        console.log('Connecting to MongoDB...')
        client = new MongoClient(uri)
        await client.connect()
        console.log('MongoDB connected successfully')
        
        db = client.db('nostromo')
        
        return { client, db }
    } catch (error) {
        console.error('MongoDB connection error:', error)
        throw error
    }
}

export async function getDatabase() {
    try {
        if (!db) {
            await connectToDatabase()
        }
        return db!
    } catch (error) {
        console.error('Error getting database:', error)
        throw error
    }
}
