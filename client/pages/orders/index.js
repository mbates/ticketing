import { useContext } from "react";

const ListOrders = ({ orders }) => {
  return (
    <div>
      <ul>
        {orders.map((o) => {
          return (
            <li key={o.id}>
              {o.ticket.title} - {o.status}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

ListOrders.getInitialProps = async (useContext, client) => {
  const { data } = await client.get("/api/orders");

  return { orders: data };
};

export default ListOrders;
