import express, { Application, json, urlencoded } from "express";
import { SERVER } from "./constants/env.constants";
import v1 from "./api/v1/index";
import session from "express-session";
const app: Application = express();

/**@OPTION BODY_PARSER & Session */
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    saveUninitialized: false,
    resave: false,
  })
);


/**@ROUTER per VERSION */
app.use("/api/v1", v1);

/**@SERVER listen to server */
app.listen(SERVER.PORT, () => {
  console.log("server open");
});
