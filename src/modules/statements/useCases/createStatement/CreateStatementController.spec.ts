import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { createConnection } from "../../../../database";

let connection: Connection;
let token: string;

describe("Create statement", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const user = {
      name: "user",
      email: "user@email.com",
      password: "123",
    };

    await request(app).post("/api/v1/users").send(user);

    const sessionResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: user.email, password: user.password });

    token = `Bearer ${sessionResponse.body.token}`;
  });

  it("should be able to create a deposit statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", token)
      .send({ amount: 100, description: "Example deposit" });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should be able to create a withdraw statement", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", token)
      .send({ amount: 50, description: "Example deposit" });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", token)
      .send({ amount: 50, description: "Example withdraw" });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to create statement if user does not exists", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", "Bearer 0000")
      .send({ amount: 50, description: "Example deposit" });

    expect(response.statusCode).toBe(401);
  });

  it("should not be able to create a withdraw statement if has insufficient funds", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", token)
      .send({ amount: 999, description: "Example withdraw" });

    expect(response.statusCode).toBe(400);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});
