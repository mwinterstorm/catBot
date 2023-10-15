import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';

//For env File 
dotenv.config({ path: `.env.${process.env.NODE_ENV}`});

const app: Application = express();
const port = process.env.PORT || 5508;

app.get('/', (req: Request, res: Response) => {
  console.log( process.env.TEST);
  
  res.json( {meow: 'meow! catbot is a-okish!',});
});

app.listen(port, () => {
  console.log(`catbot is listening at http://localhost:${port}`);
});
