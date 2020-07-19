import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exists');
    }

    const productsIds = products.map(product => {
      return { id: product.id };
    });

    const findProducts = await this.productsRepository.findAllById(productsIds);

    if (findProducts.length < products.length) {
      throw new AppError('One or more product does not exist');
    }

    const productsWithPrice = findProducts.map(product => {
      const productQuantityBuy = products.find(
        findProduct => findProduct.id === product.id,
      );

      if (!productQuantityBuy) {
        throw new AppError('Invalid product');
      }

      if (productQuantityBuy.quantity > product.quantity) {
        throw new AppError(
          "Sorry, we don't have this quantity of the product you choose",
        );
      }

      // eslint-disable-next-line no-param-reassign
      product.quantity -= productQuantityBuy.quantity;

      return {
        product_id: product.id,
        price: product.price,
        quantity: productQuantityBuy.quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: productsWithPrice,
    });

    const newQuantity = findProducts.map(product => {
      return {
        id: product.id,
        quantity: product.quantity,
      };
    });

    await this.productsRepository.updateQuantity(newQuantity);

    return order;
  }
}

export default CreateOrderService;
