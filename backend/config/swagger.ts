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
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./backend/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
