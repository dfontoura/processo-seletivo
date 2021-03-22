import express, { urlencoded, json } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import optimizer from './optimizer.js'

const app = express();

app.use(morgan('dev'));
app.use(urlencoded({ extended: false}));
app.use(json());
app.use(cors());

app.post('/', (req, res) => {
  const command = req.body;
  
  if (!command) {
    return res.status(400).end();
  }

  const containerSize = command.container;
  const boxTypesInfos = command.boxTypes;
  
  console.log(command.container);

  if (containerSize && boxTypesInfos) {
    const solution = optimizer(containerSize, boxTypesInfos)
    return res.json(solution);
  } else return res.json('dados não reconhecidos');

  });

app.listen(443, () => console.log('Listening to port 443'));