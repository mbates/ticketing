import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const ShowOrder = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (p) => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    // No parenthesis to set findTimeLeft by reference.
    // If parenthesis is included findTimeLeft will be called on render.
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order expired!</div>;
  }

  // @todo move the stripe key to a next ENV_VAR
  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <br />
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51R5CdQGPJ9IU1opIXOzyZY0odvoPKWsyghcF3vBArn4GZpnZ6SqR1MCBjA2F71uuD1zAQSj4uJMCj7lPTT2yeUPm00SJ5ViwUu"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

ShowOrder.getInitialProps = async (context, client) => {
  const { orderId } = context.query; // get the routes param/s from the query string
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default ShowOrder;
