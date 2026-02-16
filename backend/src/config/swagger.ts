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
            schemas: {
                Bounty: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        amount: { type: "string" },
                        status: { type: "string", enum: ["open", "paid"] },
                        prNumber: { type: "number", nullable: true },
                        issueNumber: { type: "number", nullable: true },
                        repoId: { type: "string", format: "uuid" },
                        createdAt: { type: "string", format: "date-time" },
                    }
                },
                Repository: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        fullName: { type: "string" },
                        nearWallet: { type: "string", nullable: true },
                    }
                }
            }
        },
    },
    apis: ["./src/routes/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);
