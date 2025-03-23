export enum OrderStatus {
  // order has been created, but the ticket has not been reserved
  Created = "created",

  // @todo split into 3 different values
  // ticket is already reserved or
  // user has cancelled order or
  // order expires before payment
  Cancelled = "cancelled",

  // order has reserved ticket
  AwaitingPayment = "awaiting-payment",

  // user provides payment for reserved ticket
  Complete = "complete",
}
