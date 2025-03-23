import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from "@bates-solutions/ticketing-common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
