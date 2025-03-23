import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from "@bates-solutions/ticketing-common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
