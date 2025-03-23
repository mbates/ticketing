import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@bates-solutions/ticketing-common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
