import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

describe("PUT /api/tickets/[id]", () => {
  const seedTicket = async (title: string, price: number, userId: string) => {
    const ticket = Ticket.build({ title, price, userId });
    return await ticket.save();
  };

  it("returns 404 when ticket not found", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .put(`/api/tickets/${id}`)
      .set("Cookie", global.signin())
      .send({
        title: "ticket-title",
        price: 1,
      })
      .expect(404);
  });

  it("returns 401 when user is not authenticated", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .put(`/api/tickets/${id}`)
      .send({
        title: "ticket-title",
        price: 1,
      })
      .expect(401);
  });

  it("returns 403 when user does not own ticket", async () => {
    const title = "ticket-title";
    const price = 1;
    const userId = "user-id";
    const ticket = await seedTicket(title, price, userId);

    await request(app)
      .put(`/api/tickets/${ticket._id}`)
      .send({
        title: "new-title",
        price: 2,
      })
      .set("Cookie", global.signin())
      .expect(403);
  });

  it("returns 400 when ticket payload is invalid", async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post(`/api/tickets`)
      .set("Cookie", cookie)
      .send({
        title: "title",
        price: 1,
      });
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: "",
        price: 2,
      })
      .expect(400);
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: "ok-title",
        price: -2,
      })
      .expect(400);
  });

  it("returns 200 and updates ticket when payload is valid", async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post(`/api/tickets`)
      .set("Cookie", cookie)
      .send({
        title: "title",
        price: 1,
      });
    const ticket = await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: "new-title",
        price: 2,
      })
      .expect(200);

    expect(ticket.body.title).toEqual("new-title");
    expect(ticket.body.price).toEqual(2);
  });

  it("publishes an event", async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post(`/api/tickets`)
      .set("Cookie", cookie)
      .send({
        title: "title",
        price: 1,
      });
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: "new-title",
        price: 2,
      })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it("responds with 400 when ticket is reserved", async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post(`/api/tickets`)
      .set("Cookie", cookie)
      .send({
        title: "title",
        price: 1,
      });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: "new-title",
        price: 2,
      })
      .expect(400);
  });
});
