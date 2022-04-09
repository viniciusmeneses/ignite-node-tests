import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { createConnection } from "../../../../database";

let connection: Connection;

describe("Authenticate user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  it("should be able to authenticate user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User",
      email: "user@email.com",
      password: "123",
    });

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "user@email.com", password: "123" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
  });

  it("should not be able to authenticate user with non-existent email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Second user",
      email: "user2@email.com",
      password: "123",
    });
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "test@email.com", password: "123" });

    expect(response.statusCode).toBe(401);
  });

  it("should not be able to authenticate user with invalid password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Third user",
      email: "user3@email.com",
      password: "123",
    });
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "user3@email.com", password: "000" });

    expect(response.statusCode).toBe(401);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});
