export class CartItem {
  constructor({
    title,
    image,
    quantity,
    productId,
    unitPrice,
    currency,
    tax,
    cartItemId,
    productShipping,
    available_shippings,
  }) {
    this.title = title;
    this.image = image;
    this.quantity = quantity;
    this.productId = productId;
    this.unitPrice = unitPrice;
    this.currency = currency;
    this.tax = tax;
    this.cartItemId = cartItemId;
    this.productShipping = productShipping;
    this.available_shippings = available_shippings ?? [];
  }
}
