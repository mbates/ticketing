import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

describe("DELETE /api/orders/[id]", () => {
  it.todo("responds with 404 when order does not exist");
  it.todo("responds with 401 when user not authenticated");
  it.todo("responds with 403 with current user is not owner");
  it.todo("responds with 400 with orderId is invalid");

  it("responds with 200 and sets order to cancelled", async () => {
    // GIVEN
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 10,
    });
    await ticket.save();
    const user = global.signin();

    // WHEN
    const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201);
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send()
      .expect(204);

    // THEN
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it("publishes an event", async () => {
    // GIVEN
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 10,
    });
    await ticket.save();
    const user = global.signin();

    // WHEN
    const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201);
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send()
      .expect(204);

    // THEN
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
