const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("ws");
const cors = require("cors");
require("dotenv").config();

const Patientrouter = require("./Routes/PatientRoutes");
const Doctorrouter = require("./Routes/DoctorRoutes");
const Receptionistrouter = require("./Routes/ReceptionistRoutes");
const path = require('path');
const { AuthenticateUser } = require("./utils");

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

app.use(express.json());
app.use(cors({ origin: '*' }));

app.use("/patient", Patientrouter);
app.use("/doctor", Doctorrouter);
app.use("/receptionist", Receptionistrouter);


mongoose.connect(process.env.MONGODB_STRING)
    .then(() => {
        console.log("Connected to database");
    })
    .catch(err => {
        console.log("Error: ", err);
    });



const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
