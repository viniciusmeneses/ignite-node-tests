import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { createConnection } from "../../../../database";
import { User } from "../../entities/User";
import { v4 as uuidv4 } from "uuid";

let connection: Connection;

describe("Show user profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        id: uuidv4(),
        name: "admin",
        email: "admin@admin.com.br",
        password: await hash("admin", 8),
      })
      .execute();
  });

  it("should be able to show profile for user", async () => {
    const sessionResponse = await request(app).post("/api/v1/sessions").send({
      email: "admin@admin.com.br",
      password: "admin",
    });

    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${sessionResponse.body.token}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to show profile for non-existing user", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", "Bearer 11111")
      .send();

    expect(response.statusCode).toBe(401);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});
