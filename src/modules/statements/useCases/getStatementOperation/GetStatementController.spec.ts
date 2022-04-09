import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { createConnection } from "../../../../database";
import { Statement } from "../../entities/Statement";

let connection: Connection;
let statement: Statement;
let token: string;

describe("Get statement", () => {
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

    const statementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", token)
      .send({ amount: 50, description: "Example deposit" });

    statement = statementResponse.body;
  });

  it("should be able to get specific statement", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${statement.id}`)
      .set("Authorization", token)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to get specific statement from non-existing user", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${statement.id}`)
      .set("Authorization", "Bearer 0000")
      .send();

    expect(response.statusCode).toBe(401);
  });

  it("should not be able to get non-existing statement", async () => {
    const response = await request(app)
      .get("/api/v1/statements/73db7bfe-a9a8-456d-a64f-412bb6876190")
      .set("Authorization", token)
      .send();

    expect(response.statusCode).toBe(404);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});
