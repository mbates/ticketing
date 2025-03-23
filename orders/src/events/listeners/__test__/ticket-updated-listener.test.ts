import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@bates-solutions/ticketing-common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 15,
  });
  await ticket.save();

  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "play",
    price: 150,
    userId: "user-id",
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    ticket,
    listener,
    data,
    msg,
  };
};

describe("ticket-updated-listener successes", () => {
  it("finds, updates and saves a ticket", async () => {
    const { ticket, listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
  });

  it("acks the message", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
  });
});

describe("ticket-updated-listener fails", () => {
  it("event not acknowledged when version is 'in the future'", async () => {
    const { listener, data, msg } = await setup();
    data.version++;
    try {
      await listener.onMessage(data, msg);
    } catch (_err) {}

    expect(msg.ack).not.toHaveBeenCalled();
  });

  it("event not acknowledged when version is 'in the past'", async () => {
    const { listener, data, msg } = await setup();
    data.version--;
    try {
      await listener.onMessage(data, msg);
    } catch (_err) {}

    expect(msg.ack).not.toHaveBeenCalled();
  });
});
