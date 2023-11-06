import http from "http";
import express from 'express';
import bodyParser from 'body-parser';
import { authMiddleware } from "../lib/api/auth.js";
import { auctionRouter, collectionRouter, lenderRouter, lienRouter } from "./http/retrieve.js";
import { executeRouter } from "./http/execute.js";

const app = express();
app.use(bodyParser.json());
app.use(authMiddleware);

app.use('/lien', lienRouter);
app.use('/collection', collectionRouter);
app.use('/lender', lenderRouter);
app.use('/auction', auctionRouter);

app.use('/execute', executeRouter);

export const server = http.createServer(app);
