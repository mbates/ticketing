import mongoose from "mongoose";

interface PaymentAttributes {
  orderId: string;
  stripeId: string;
}

interface PaymentDocument extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDocument> {
  build(attrs: PaymentAttributes): PaymentDocument;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      required: true,
      type: String,
    },
    stripeId: {
      required: true,
      type: String,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret.id;
      },
    },
  }
);

paymentSchema.statics.build = (attrs: PaymentAttributes) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDocument, PaymentModel>(
  "Payment",
  paymentSchema
);

export { Payment };
