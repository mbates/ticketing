import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from "@bates-solutions/ticketing-common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
