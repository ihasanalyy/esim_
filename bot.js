import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import botRoutes from "./routes/botRoutes.js";
import connectDB from "./config/dbconfig.js";

dotenv.config()

const app = express();

app.use(bodyParser.json());
app.use(express.json()); 
connectDB()

app.use("/", botRoutes);


const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})
