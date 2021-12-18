import express, { Response, Request } from 'express';
import { createConnection } from 'typeorm';
import ampqlib from 'amqplib/callback_api';
import { Product } from '../model/model';

const router = express.Router();
createConnection().then(async (database) => {
	const productRepository = database.getRepository(Product);

	ampqlib.connect(
		'amqps://cloudServiceforRabbitMQ',
		(connectErr, connection) => {
			if (connectErr) {
				return new Error(
					'something is wrong about connect to the rabbitmq server '
				);
			}
			return connection.createChannel((channelErr, channel) => {
				if (channelErr) {
					throw new Error(
						'somthing is wrong about creating channel ' + channelErr
					);
				}
				router.get('/api/products', async (req: Request, res: Response) => {
					const allProduct = await productRepository.find({});

					res.json(allProduct);
				});
				router.post('/api/products', async (req: Request, res: Response) => {
					const newProduct = await productRepository.create(req.body);
					const result = await productRepository.save(newProduct);
					channel.sendToQueue(
						'product_created',
						Buffer.from(JSON.stringify(result))
					);
					console.log('published');
					res.json(result);
				});
				router.get('/api/products/:id', async (req: Request, res: Response) => {
					const specificProduct = await productRepository.findOne(
						req.params.id
					);
					res.json(specificProduct);
				});
				router.patch(
					'/api/products/:id',
					async (req: Request, res: Response) => {
						const specificProduct = await productRepository.findOne(
							req.params.id
						);
						if (!specificProduct) {
							throw new Error('there is not any product with this ID ');
						}
						await productRepository.merge(specificProduct, req.body);
						const result = await productRepository.save(specificProduct);
						channel.sendToQueue(
							'product_updated',
							Buffer.from(JSON.stringify(result))
						);
						console.log('published');

						res.json(result);
					}
				);

				router.delete(
					'/api/products/:id',
					async (req: Request, res: Response) => {
						await productRepository.delete(req.params.id);
						channel.sendToQueue(
							'product_deleted',
							Buffer.from(
								JSON.stringify(`product with ${req.params.id} was deleted`)
							)
						);
						res.send(
							`Product with this ${req.params.id} was deleted from database`
						);
					}
				);
				process.on('beforeExit', () => {
					console.log('closing');
					connection.close();
				});
			});
		}
	);
});

export { router };
