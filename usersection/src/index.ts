import express from 'express';
import { json } from 'body-parser';
import { router } from './routes/routers';
import mongoose from 'mongoose';

const Start = async () => {
	try {
		await mongoose.connect('mongodb://localhost:27017/product', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('DataBase is connected');
	} catch (error) {
		console.log(error);
	}

	const app = express();
	const port = 3001;
	app.use(router);
	app.use(json());
	app.listen(port, () => {
		console.log('Listening  port ' + port);
	});
};

Start();
