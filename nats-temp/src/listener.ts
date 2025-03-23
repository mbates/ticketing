import nats from "node-nats-streaming";
import { randomBytes } from "crypto";

import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear();

const client = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: " http://localhost:4222",
});

client.on("connect", () => {
  console.log("Listener connected to NATS, `rs` to restart");

  client.on("close", () => {
    console.log("Listener disconnected");
    process.exit();
  });

  new TicketCreatedListener(client).listen();
});

process.on("SIGIT", () => client.close());
process.on("SIGTERM", () => client.close());
