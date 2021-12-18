import mongoose from 'mongoose';

interface modelAttr {
	title: string;
	price: string;
	image: string;
	admin_id: string;
}

interface modelDoc extends mongoose.Document {
	title: string;
	price: string;
	image: string;
	admin_id: string;
}

interface productmodel extends mongoose.Model<modelDoc> {
	build(Attr: modelAttr): modelDoc;
}

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: String,
			required: true,
		},
		admin_id: {
			required: true,
			type: String,
		},
		image: {
			type: String,
			required: true,
		},
	},
	{
		toJSON: {
			transform(ret, doc) {
				ret.id = ret._id;
				delete ret._id;
				ret.price = ret.price + ' $';
			},
		},
	}
);

productSchema.statics.build = (attr: modelAttr) => {
	return new Product(attr);
};

const Product = mongoose.model<modelDoc, productmodel>(
	'Product',
	productSchema
);

export { Product };
