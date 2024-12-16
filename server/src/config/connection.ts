import {config} from 'dotenv';

config();
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const db = async (): Promise<typeof mongoose.connection> => {
    if (!MONGODB_URI) {
        throw new Error('Missing MongoDB URI environment variable!');
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Database connected.');
        return mongoose.connection;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

export default db;
