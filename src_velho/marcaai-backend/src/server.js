import 'dotenv/config';
import globalRouter from "./routes/index.js"
import { globalErrorHandler } from './middlewares/globalErrorHandler.js';
import express from "express";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());

// todas as rotas vão ser dentro de "/api", menos redundancia e mais organizado
// todas as requests qeu vierem pro express e q tem /api no começo vao ser jogadas no globalRouter
app.use("/api", globalRouter);

// se algum controller lançar exceção ele vai ser capturado por esse errorHandler. é mais centralizado e vc pode fazer oq vc quiser com o erro la, deveria fazer.
app.use(globalErrorHandler)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Back-end MarcaAí rodando na porta ${PORT}`));
