import {
  Connection,
  createConnection as ormCreateConnection,
  getConnectionOptions,
} from "typeorm";

export const createConnection = async (): Promise<Connection> => {
  const options = await getConnectionOptions();

  return ormCreateConnection(
    Object.assign(options, {
      database:
        process.env.NODE_ENV === "test" ? "fin_api_test" : options.database,
    })
  );
};
