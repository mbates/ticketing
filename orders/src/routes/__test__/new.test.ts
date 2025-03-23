import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

describe("POST /api/orders", () => {
  it("requests do not respond with 404", async () => {
    const response = await request(app).post("/api/orders").send({});

    expect(response.status).not.toEqual(404);
  });

  it("responds with 401 if not authenticated", async () => {
    await request(app).post("/api/orders").send({}).expect(401);
  });

  it("does not respond with 401 when authenticated", async () => {
    const response = await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it("returns a 400 with an invalid ticketId", async () => {
    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({
        ticketId: "",
      })
      .expect(400);

    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({})
      .expect(400);
  });

  it("responds with 404 if no ticket", async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({ ticketId })
      .expect(404);
  });

  it("responds with 400 if ticket is already reserved", async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 15,
    });
    await ticket.save();

    const order = Order.build({
      userId: "123",
      status: OrderStatus.Created,
      expiresAt: new Date(),
      ticket,
    });
    await order.save();

    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({ ticketId: ticket.id })
      .expect(400);
  });

  it("responds with 201 with valid payload and no reserved tickets", async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 15,
    });
    await ticket.save();

    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({ ticketId: ticket.id })
      .expect(201);
  });

  it("publishes an event", async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 15,
    });
    await ticket.save();

    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
