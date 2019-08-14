let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let app = express();

// This is necessary middleware to parse JSON into the incoming request body for POST requests
app.use(bodyParser.json());

/**
 * Security Considerations:
 * - Must implement CORS in order to be called from a web browser
 */
app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Expose-Headers', 'Origin, Accept, Content-Location, ' +
        'Location, X-Requested-With');

    // Pass to next layer of middleware
    next();
});

/**
 * Authorization.
 */
app.use((request, response, next) => {
    // Always allow OPTIONS requests as part of CORS pre-flight support.
    if (request.method === 'OPTIONS') {
        next();
        return;
    }

    let serviceHost = request.get('Host');
    let authorizationHeader = request.get('Authorization') || 'Bearer open'; // Default a token until ready to enable auth.

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer')) {
        response.set('WWW-Authenticate', `Bearer realm="${serviceHost}", error="invalid_token", error_description="No Bearer token provided."`)
        return response.status(401).end();
    }

    let token = authorizationHeader.replace('Bearer ', '');
    let aud = `${request.protocol}://${serviceHost}${request.originalUrl}`;

    let isValid = true; // Verify token validity per https://cds-hooks.org/specification/1.0/#trusting-cds-client

    if (!isValid) {
        response.set('WWW-Authenticate', `Bearer realm="${serviceHost}", error="invalid_token", error_description="Token error description."`)
        return response.status(401).end();
    }

    // Pass to next layer of middleware
    next();
});

app.use(express.static(path.join(__dirname, '/')));

app.get('/smart-launch', (request, response) => {
    console.log(request);
    response.sendFile(path.join(__dirname + '/launch.html'));
});

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname + '/index.html'));
});

// Here is where we define the port for the localhost server to setup
app.listen(5050);
