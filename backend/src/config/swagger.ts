import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ProductWhisper API',
      version: '1.0.0',
      description: 'API documentation for ProductWhisper',
      contact: {
        name: 'ProductWhisper Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'Products',
        description: 'Product management endpoints'
      },
      {
        name: 'Search',
        description: 'Search and favorites endpoints'
      }
    ]
  },
  apis: ['./src/controllers/*.ts', './src/models/*.ts']
};

const specs = swaggerJsdoc(options);

export default specs;
