import express from 'express';
import { json } from 'body-parser';
import { router } from './routes/routers';

const app = express();
const port = 3000;

app.use(json());
app.use(router);

app.listen(port, () => {
	console.log('Listening  port ' + port);
});
