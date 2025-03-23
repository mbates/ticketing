import Router from "next/router";
import useRequest from "../../hooks/use-request";

const ShowTicket = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (o) => Router.push("/orders/[orderId]", `/orders/${o.id}`),
  });

  // No parenthesis to set doRequest by reference.
  // If parenthesis is included doRequest will be called on render.
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button className="btn btn-primary" onClick={(event) => doRequest()}>
        Purchase
      </button>
    </div>
  );
};

ShowTicket.getInitialProps = async (context, client) => {
  const { ticketId } = context.query; // get the routes param/s from the query string
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data };
};

export default ShowTicket;
