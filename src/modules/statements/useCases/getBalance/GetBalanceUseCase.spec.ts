import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it("should be able to get user's balance", async () => {
    const user = await usersRepository.create({
      name: "User",
      email: "user@example.com",
      password: "123",
    });

    const { balance, statement } = await getBalanceUseCase.execute({
      user_id: user.id!,
    });

    expect(balance).toBeGreaterThanOrEqual(0);
    expect(statement.length).toBeGreaterThanOrEqual(0);
  });

  it("should not be able to get balance from non-existing user", async () => {
    expect(() =>
      getBalanceUseCase.execute({
        user_id: "1111",
      })
    ).rejects.toBeInstanceOf(GetBalanceError);
  });
});
