import express, { Request, Response } from "express";

import { Payment } from "../models/payment";

const router = express.Router();

router.get("/api/payments", async (req: Request, res: Response) => {
  const payments = await Payment.find();

  res.send(payments);
});

export { router as indexPaymentRouter };
