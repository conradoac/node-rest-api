const dotEnv = require('dotenv');
const mongoose = require('mongoose');

dotEnv.config();

async function run() {
    try {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        await listen();
        console.log('Running...');
    } catch (e) {
        console.log('Failed to start the server.', e);
        process.exit(0);
    }
}

function listen() {
    return new Promise(resolve => {
        const server = require('./server');
        const port = process.env.PORT || 8080;
    
        server.listen(port, () => {
            resolve(server);
        });
    });
}

run();