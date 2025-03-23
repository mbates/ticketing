import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
// import { Payment } from "../../models/payment";
import { OrderStatus } from "@bates-solutions/ticketing-common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

jest.mock("../../stripe");

describe("POST /api/payments with mock", () => {
  it("responds with 404 when order does not exist", async () => {
    await request(app)
      .post("/api/payments")
      .set("Cookie", global.signin())
      .send({
        token: "qwerty",
        orderId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(404);
  });

  it("responds with 403 when order is not owned by user", async () => {
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      price: 20,
      status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
      .post("/api/payments")
      .set("Cookie", global.signin())
      .send({
        token: "qwerty",
        orderId: order.id,
      })
      .expect(403);
  });

  it("responds with 400 when order is cancelled", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId,
      version: 0,
      price: 20,
      status: OrderStatus.Cancelled,
    });
    await order.save();

    await request(app)
      .post("/api/payments")
      .set("Cookie", global.signin(userId))
      .send({
        token: "qwerty",
        orderId: order.id,
      })
      .expect(400);
  });

  it("responds with 201 when request is valid", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId,
      version: 0,
      price: 20,
      status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
      .post("/api/payments")
      .set("Cookie", global.signin(userId))
      .send({
        token: "tok_visa",
        orderId: order.id,
      })
      .expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual("tok_visa");
    expect(chargeOptions.amount).toEqual(2000);
    expect(chargeOptions.currency).toEqual("usd");

    const payment = await Payment.findOne({
      orderId: order.id,
      stripeId: "charge-id", // value is set in __mocks__/stripe.ts
    });

    expect(payment).not.toBeNull();
  });
});
