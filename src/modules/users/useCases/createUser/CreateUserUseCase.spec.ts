import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "user@email.com",
      password: "123",
    };

    const createdUser = await createUserUseCase.execute(user);

    expect(createdUser).toHaveProperty("id");
    expect(createdUser).toMatchObject({ name: user.name, email: user.email });
  });

  it("should not be able to create a new user with existing email", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User",
        email: "user@email.com",
        password: "123",
      });

      await createUserUseCase.execute({
        name: "User2",
        email: "user@email.com",
        password: "12345",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
