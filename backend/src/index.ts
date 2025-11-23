import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createApiRoutes } from './routes/api.js';
import { getOpenApiComponents } from './schemas/bookingSchemas.js';
import { createContainer } from './container.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (not from dist/)
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Log environment variable status (without exposing values)
console.log('Environment variables loaded from:', envPath);
console.log('SEARCHAPI_IO_API_KEY:', process.env.SEARCHAPI_IO_API_KEY ? '✓ Set' : '✗ Not set');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

const components = getOpenApiComponents();

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hacker House Booking Agent API',
            version: '1.0.0',
            description: 'API for searching and booking hacker houses',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
        components: components
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // files containing annotations as above
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Initialize dependencies
const dependencies = createContainer();
const apiRoutes = createApiRoutes(dependencies);

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Hacker House Booking Agent API is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
