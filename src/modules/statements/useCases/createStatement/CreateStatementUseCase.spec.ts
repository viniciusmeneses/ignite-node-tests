import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";

import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let user: User;

describe("Create statement", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );

    user = await usersRepository.create({
      name: "User",
      email: "user@email.com",
      password: "123",
    });
  });

  it("should be able to create a deposit statement", async () => {
    const statement: ICreateStatementDTO = {
      amount: 100,
      description: "Example deposit",
      type: OperationType.DEPOSIT,
      user_id: user.id!,
    };

    const deposit = await createStatementUseCase.execute(statement);

    expect(deposit).toHaveProperty("id");
    expect(deposit).toMatchObject(statement);
  });

  it("should be able to create a withdraw statement", async () => {
    createStatementUseCase.execute({
      amount: 200,
      description: "Example deposit",
      type: OperationType.DEPOSIT,
      user_id: user.id!,
    });

    const statement: ICreateStatementDTO = {
      amount: 50,
      description: "Example withdraw",
      type: OperationType.WITHDRAW,
      user_id: user.id!,
    };

    const withdraw = await createStatementUseCase.execute(statement);

    expect(withdraw).toHaveProperty("id");
    expect(withdraw).toMatchObject(statement);
  });

  it("should not be able to create statement if user does not exists", async () => {
    expect(() =>
      createStatementUseCase.execute({
        amount: 500,
        description: "Example deposit",
        type: OperationType.DEPOSIT,
        user_id: "111",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a withdraw statement if has insufficient funds", async () => {
    expect(() =>
      createStatementUseCase.execute({
        amount: 10,
        description: "Example withdraw",
        type: OperationType.WITHDRAW,
        user_id: user.id!,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
