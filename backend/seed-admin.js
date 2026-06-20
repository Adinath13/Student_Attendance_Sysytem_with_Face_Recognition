import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env file');
    process.exit(1);
}

const seedAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected successfully!');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'admin123';

        // Check if user exists
        const existingUser = await User.findOne({ email: adminEmail });

        if (existingUser) {
            console.log(`User ${adminEmail} found. Updating password...`);
            existingUser.password = adminPassword;
            existingUser.role = 'admin'; // Ensure role is admin
            await existingUser.save();
            console.log('✅ User updated successfully!');
        } else {
            console.log(`User ${adminEmail} not found. Creating new admin user...`);
            const newUser = new User({
                name: 'Admin User',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                department: 'Administration',
                year: 4 // Arbitrary
            });
            await newUser.save();
            console.log('✅ Admin user created successfully!');
        }

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    }
};

seedAdmin();
