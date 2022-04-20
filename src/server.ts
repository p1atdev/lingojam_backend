import Fastify from "fastify"

const PORT = (process.env.PORT || 3000) as number
const HOST = process.env.HOST || "0.0.0.0"

const fastify = Fastify({
    logger: true,
})

// Declare a route
fastify.get("/", async (request, reply) => {
    reply.send({ hello: "world" })
})

// Run the server!
fastify.listen(PORT, HOST, async (err, address) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    // Server is now listening on ${address}
    console.log(`Server listening on ${address}`)
})
