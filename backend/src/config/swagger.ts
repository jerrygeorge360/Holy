import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Holy Backend API",
            version: "1.0.0",
            description: "API documentation for the Holy backend management layer.",
        },
        servers: [
            {
                url: "http://localhost:3001",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./src/routes/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);
