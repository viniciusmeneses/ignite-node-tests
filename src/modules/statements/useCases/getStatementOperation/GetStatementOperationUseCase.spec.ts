import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getStatementUseCase: GetStatementOperationUseCase;

let user: User;
let statement: Statement;

describe("Get statement", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );

    user = await usersRepository.create({
      name: "User",
      email: "user@example.com",
      password: "123",
    });

    statement = await statementsRepository.create({
      amount: 100,
      description: "Deposit statement",
      type: OperationType.DEPOSIT,
      user_id: user.id!,
    });
  });

  it("should be able to get specific statement", async () => {
    const gotStatement = await getStatementUseCase.execute({
      user_id: user.id!,
      statement_id: statement.id!,
    });

    expect(gotStatement).toMatchObject(statement);
  });

  it("should not be able to get specific statement from non-existing user", async () => {
    expect(() =>
      getStatementUseCase.execute({
        user_id: "1111",
        statement_id: statement.id!,
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get non-existing statement", async () => {
    expect(() =>
      getStatementUseCase.execute({
        user_id: user.id!,
        statement_id: "1234",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
