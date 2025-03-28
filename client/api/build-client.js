import axios from "axios";

export default ({ req }) => {
  // Local Cluster
  // if (typeof window === "undefined") {
  //   // We are on the server
  //   return axios.create({
  //     baseURL:
  //       "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
  //     headers: req.headers,
  //   });
  // }

  // Deployed Domain
  if (typeof window === "undefined") {
    // We are on the server
    return axios.create({
      baseURL: "http://tickets.bates-solutions.com",
      headers: req.headers,
    });
  } else {
    // We must be on the browser
    return axios.create({
      baseUrl: "/",
    });
  }
};
