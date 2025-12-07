import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Using MongoDB URI:', MONGODB_URI ? 'Found' : 'Not Found');

if (!MONGODB_URI) {
    console.error('Please set MONGODB_URI in backend/.env');
    process.exit(1);
}


async function checkRegisteredUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully!\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        // Find all users
        const allUsers = await User.find({});
        console.log(`Total users in database: ${allUsers.length}\n`);

        // Find users with registered faces
        const registeredUsers = await User.find({ faceRegistered: true });
        console.log(`Users with registered faces: ${registeredUsers.length}\n`);

        if (registeredUsers.length > 0) {
            console.log('Registered users:');
            registeredUsers.forEach(user => {
                const encodingLength = user.faceEncoding ? user.faceEncoding.length : 0;
                console.log(`- ${user.name} (${user.email})`);
                console.log(`  Student ID: ${user.studentId || 'N/A'}`);
                console.log(`  Role: ${user.role}`);
                console.log(`  Face Registered: ${user.faceRegistered}`);
                console.log(`  Face Encoding Length: ${encodingLength}`);
                if (encodingLength === 0) {
                    console.log('  ⚠️ WARNING: Face registered flag is true but encoding is empty!');
                }
            });
        } else {
            console.log('⚠️  NO USERS HAVE REGISTERED THEIR FACES YET!');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\nConnection closed.');
    }
}

checkRegisteredUsers();
