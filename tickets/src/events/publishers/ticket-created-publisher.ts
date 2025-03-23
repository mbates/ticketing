import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@bates-solutions/ticketing-common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
