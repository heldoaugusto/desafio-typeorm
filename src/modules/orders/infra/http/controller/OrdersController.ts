import { Request, Response, json } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    // TODO
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id } = request.body;
    const { products } = request.body.products;

    const CreateOrder = container.resolve(CreateOrderService);

    CreateOrder.execute({ customer_id, products });

    return response.json(200);
  }
}
