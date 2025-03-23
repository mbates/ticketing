import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

describe("POST /api/tickets", () => {
  it("requests do not respond with 404", async () => {
    const response = await request(app).post("/api/tickets").send({});

    expect(response.status).not.toEqual(404);
  });

  it("responds with 401 if not authenticated", async () => {
    await request(app).post("/api/tickets").send({}).expect(401);
  });

  it("does not respond with 401 when authenticated", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", global.signin())
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it("returns a 400 with an invalid title", async () => {
    await request(app)
      .post("/api/tickets")
      .set("Cookie", global.signin())
      .send({
        title: "",
        price: 10,
      })
      .expect(400);

    await request(app)
      .post("/api/tickets")
      .set("Cookie", global.signin())
      .send({
        price: 10,
      })
      .expect(400);
  });

  it("returns a 400 with an invalid price", async () => {
    await request(app)
      .post("/api/tickets")
      .set("Cookie", global.signin())
      .send({
        title: "ticket-name",
        price: -10,
      })
      .expect(400);

    await request(app)
      .post("/api/tickets")
      .set("Cookie", global.signin())
      .send({
        title: "ticket-name",
      })
      .expect(400);
  });

  it("returns a 201 with valid ticket payload", async () => {
    const title = "new-ticket";
    const price = 20;
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app)
      .post("/api/tickets")
      .set("Cookie", global.signin())
      .send({ title, price })
      .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
  });

  it("publishes an event", async () => {
    const title = "new-ticket";
    const price = 20;

    await request(app)
      .post("/api/tickets")
      .set("Cookie", global.signin())
      .send({ title, price })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
