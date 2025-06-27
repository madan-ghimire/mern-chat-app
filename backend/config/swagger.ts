import swaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MERN Chat App API",
      version: "1.0.0",
      description: "API documentation for the MERN Chat App",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              format: "ObjectId",
              description: "The unique identifier of the user"
            },
            firstName: {
              type: "string",
              required: true,
              description: "User's first name"
            },
            lastName: {
              type: "string",
              required: true,
              description: "User's last name"
            },
            username: {
              type: "string",
              required: true,
              minLength: 3,
              description: "User's unique username"
            },
            email: {
              type: "string",
              format: "email",
              required: true,
              description: "User's email address"
            },
            pic: {
              type: "string",
              format: "uri",
              default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
              description: "URL to user's profile picture"
            },
            isAdmin: {
              type: "boolean",
              default: false,
              description: "Whether the user has admin privileges"
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user was created"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user was last updated"
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server"
      },
    ],
  },
  apis: ["./backend/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
