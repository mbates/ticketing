import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

describe("GET /api/tickets/[id]", () => {
  const seedTicket = async (title: string, price: number, userId: string) => {
    const ticket = Ticket.build({ title, price, userId });
    return await ticket.save();
  };

  it("return 404 when ticket not found", async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${ticketId}`).send().expect(404);
  });

  it("return 200 and ticket when ticket exists", async () => {
    const title = "ticket-title";
    const price = 1;
    const userId = "user-id";
    const ticket = await seedTicket(title, price, userId);

    const response = await request(app)
      .get(`/api/tickets/${ticket.id}`)
      .set("Cookie", global.signin())
      .send()
      .expect(200);

    expect(response.body.title).toEqual(title);
    expect(response.body.price).toEqual(price);
  });

  it("return 200 and ticket when ticket is created", async () => {
    const title = "ticket-title";
    const price = 2;

    const createResponse = await request(app)
      .post(`/api/tickets`)
      .set("Cookie", global.signin())
      .send({ title, price })
      .expect(201);

    const getResponse = await request(app)
      .get(`/api/tickets/${createResponse.body.id}`)
      .set("Cookie", global.signin())
      .send()
      .expect(200);

    expect(getResponse.body.title).toEqual(title);
    expect(getResponse.body.price).toEqual(price);
  });
});
