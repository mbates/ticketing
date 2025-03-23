import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@bates-solutions/ticketing-common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
