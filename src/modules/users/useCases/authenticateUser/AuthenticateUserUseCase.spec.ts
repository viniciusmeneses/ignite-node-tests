import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("should be able to authenticate user", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "user@email.com",
      password: "123",
    };

    await createUserUseCase.execute(user);
    const auth = await authenticateUserUseCase.execute(user);

    expect(auth.user).toHaveProperty("id");
    expect(auth.token).toBeTruthy();
  });

  it("should not be able to authenticate user with non-existent email", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User",
        email: "user@email.com",
        password: "123",
      };

      await createUserUseCase.execute(user);
      await authenticateUserUseCase.execute({
        email: "test@gmail.com",
        password: user.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate user with invalid password", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User",
        email: "user@email.com",
        password: "123",
      };

      await createUserUseCase.execute(user);
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "321",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
