import fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

const server = fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

// Basic health check route
server.get("/health", async () => {
  return { status: "ok" };
});

// Start the server
const start = async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
