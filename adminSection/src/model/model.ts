import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'myProducts' })
export class Product {
	@PrimaryGeneratedColumn('uuid')
	id: string;
	@Column()
	title: string;
	@Column()
	price: string;
	@Column()
	image: string;
}
