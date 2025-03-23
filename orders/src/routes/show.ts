import express, { Request, Response } from "express";
import {
  ForbiddenError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@bates-solutions/ticketing-common";
import { Order } from "../models/order";
import { ResultWithContextImpl } from "express-validator/lib/chain";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new ForbiddenError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
