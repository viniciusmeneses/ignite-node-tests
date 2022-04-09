import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { createConnection } from "../../../../database";

let connection: Connection;

describe("Create user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User",
      email: "user@email.com",
      password: "123",
    });

    expect(response.statusCode).toBe(201);
  });

  it("should not be able to create a new user with existing email", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Second User",
      email: "user@email.com",
      password: "321",
    });

    expect(response.statusCode).toBe(400);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});
