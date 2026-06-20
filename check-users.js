const mongoose = require('mongoose');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = //use your own;

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
                console.log(`- ${user.name} (${user.email}) - Student ID: ${user.studentId || 'N/A'}`);
                console.log(`  Face encoding length: ${user.faceEncoding ? user.faceEncoding.length : 0}`);
            });
        } else {
            console.log('⚠️  NO USERS HAVE REGISTERED THEIR FACES YET!');
            console.log('\nTo fix this:');
            console.log('1. Log in to the application');
            console.log('2. Navigate to the "Register Face" page');
            console.log('3. Capture and register your face');
        }

        console.log('\n--- All Users ---');
        allUsers.forEach(user => {
            console.log(`${user.name} (${user.email}) - Role: ${user.role} - Face Registered: ${user.faceRegistered || false}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\nConnection closed.');
    }
}

checkRegisteredUsers();
