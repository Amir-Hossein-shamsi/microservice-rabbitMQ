import express, { Response, Request } from 'express';
import { Product } from '../model/model';
import ampqlib from 'amqplib/callback_api';

const router = express.Router();

ampqlib.connect(
	'amqps://cloudServiceforRabbitMQ',
	async (connectionErr, connection) => {
		if (connectionErr) {
			throw new Error('something is wrong about connection to rabbitMq');
		}

		connection.createChannel((channelErr, channel) => {
			if (channelErr) {
				throw new Error(
					'something is wrong about channel creation to rabbitMq'
				);
			}
			channel.assertQueue('product_created', { durable: false });
			channel.assertQueue('product_updated', { durable: false });
			channel.assertQueue('product_deleted', { durable: false });

			//add data to model when channel of create is open for it
			channel.consume(
				'product_created',
				async (msg: ampqlib.Message | null) => {
					if (msg == undefined) {
						throw new Error('your message is undefined plz check it ');
					}
					const catchesProduct = await JSON.parse(msg?.content.toString());
					const product = Product.build({
						title: catchesProduct.title,
						price: catchesProduct.price,
						image: catchesProduct.image,
						admin_id: catchesProduct.id,
					});
					await product.save();
					console.log('message was added');
				},
				{ noAck: true }
			);

			//update data to model when channel of create is open for it
			channel.consume(
				'product_updated',
				async (msg: ampqlib.Message | null) => {
					if (msg == undefined) {
						throw new Error('your message is undefined plz check it ');
					}
					const catchesProduct = await JSON.parse(msg?.content.toString());
					const product = await Product.findOne({
						admin_id: catchesProduct.id,
					});
					if (!product) {
						throw new Error('your admin-id is not recognized plz check it ');
					}
					product.set({
						title: catchesProduct.title,
						price: catchesProduct.price,
						image: catchesProduct.image,
					});
					await product.save();

					console.log('message was updated');
				},
				{ noAck: true }
			);

			//delete data to model when channel of create is open for it
			channel.consume(
				'product_deleted',
				async (msg: ampqlib.Message | null) => {
					if (msg == undefined) {
						throw new Error('your message is undefined plz check it ');
					}
					const catchesProduct = await JSON.parse(msg?.content.toString());
					const product = await Product.findOne({
						admin_id: catchesProduct.id,
					});
					if (!product) {
						throw new Error('your admin-id is not recognized plz check it ');
					}
					await Product.deleteOne({ admin_id: catchesProduct.id });

					console.log('message deleted');
				},
				{ noAck: true }
			);

			router.get('/api/users/product', async (req: Request, res: Response) => {
				const findAllProduct = await Product.find();
				res.json(findAllProduct);
			});
		});
	}
);

export { router };
