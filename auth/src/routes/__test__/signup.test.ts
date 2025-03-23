import request from "supertest";
import { app } from "../../app";

describe("POST /api/users/signup", () => {
  it("responds with a 201 with valid credentials", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);
  });

  it("responds with a 400 with an invalid email", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "invalid",
        password: "password",
      })
      .expect(400);
  });

  it("responds with a 400 with an invalid password", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "pwd",
      })
      .expect(400);
  });

  it("responds with a 400 with missing email and password", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
      })
      .expect(400);
    await request(app)
      .post("/api/users/signup")
      .send({
        password: "password",
      })
      .expect(400);
  });

  it("rejects duplicate emails", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(400);
  });

  it("sets a cookie on success", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    expect(response.get("Set-Cookie")).toBeDefined();
  });
});
