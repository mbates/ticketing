import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

describe("GET /api/tickets", () => {
  const seedTicket = async (title: string, price: number, userId: string) => {
    const ticket = Ticket.build({ title, price, userId });
    return await ticket.save();
  };

  it("responds with 200 and payload with 3 tickets", async () => {
    await seedTicket("ticket-title-1", 10, "user-id");
    await seedTicket("ticket-title-2", 15, "user-id");
    await seedTicket("ticket-title-3", 5, "user-id");

    const response = await request(app).get("/api/tickets").send().expect(200);

    expect(response.body.length).toEqual(3);
  });
});
