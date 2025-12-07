import axios from 'axios';

const loginUrl = 'http://localhost:3000/api/auth/login';
const credentials = {
    email: 'adixxx.0x69@gmail.com',
    password: 'adix02A!11'
};

const testLogin = async () => {
    try {
        console.log(`Attempting login to ${loginUrl}...`);
        const response = await axios.post(loginUrl, credentials);

        console.log('✅ Login Successful!');
        console.log('Status:', response.status);
        console.log('Token received:', !!response.data.token);
        if (response.data.user) {
            console.log('User:', response.data.user.email);
            console.log('Role:', response.data.user.role);
        }
    } catch (error) {
        console.error('❌ Login Failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testLogin();
