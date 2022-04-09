import { app } from "./app";
import { createConnection } from "./database";

createConnection().then(() =>
  app.listen(3333, () => {
    console.log("Server is running");
  })
);
