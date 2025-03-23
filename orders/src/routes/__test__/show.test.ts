import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

describe("GET /api/orders/[id]", () => {
  it("responds with order when authenticated", async () => {
    // GIVEN
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 15,
    });
    await ticket.save();
    const user = global.signin();

    // WHEN
    const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // THEN
    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send()
      .expect(200);
    expect(fetchedOrder.id).toEqual(order.id);
  });

  it("responds with 403 when different user", async () => {
    // GIVEN
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 15,
    });
    await ticket.save();
    const user = global.signin();

    // WHEN
    const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // THEN
    await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Cookie", global.signin())
      .send()
      .expect(403);
  });
});
