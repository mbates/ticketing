import { Ticket } from "../ticket";

describe("ticket", () => {
  it("implements optimistic concurrency control", async () => {
    // GIVEN
    const ticket = Ticket.build({
      title: "concert",
      price: 15,
      userId: "123",
    });
    await ticket.save();

    const ticketOne = await Ticket.findById(ticket.id);
    const ticketTwo = await Ticket.findById(ticket.id);

    // WHEN
    ticketOne!.set({ price: 20 });
    ticketTwo!.set({ price: 5 });
    await ticketOne!.save();

    // THEN
    try {
      await ticketTwo!.save();
    } catch (err) {
      return;
    }

    throw new Error("Should not reach this point");
  });

  it("incremement version on multiple saves", async () => {
    // GIVEN
    const ticket = Ticket.build({
      title: "concert",
      price: 15,
      userId: "123",
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);

    // WHEN
    await ticket.save();

    // THEN
    expect(ticket.version).toEqual(1);
  });
});
