import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { createConnection } from "../../../../database";

let connection: Connection;
let token: string;

describe("Get balance", () => {
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

  it("should be able to get user's balance", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", token)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body.balance).toBeGreaterThanOrEqual(0);
  });

  it("should not be able to get balance from non-existing user", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", "Bearer 0000")
      .send();

    expect(response.statusCode).toBe(401);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});
