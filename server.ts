import express,{Application} from "express";
import {SERVER} from "./constants/env.constants"

const app:Application = express();

/**@SERVER listen to server */
app.listen(SERVER.PORT, () => {
    console.log("server open");
});

export default app;