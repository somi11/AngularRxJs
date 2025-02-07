import { Component, Input, computed } from '@angular/core';

import { NgIf, NgFor, CurrencyPipe, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { ProductService } from '../product.service';
import { EMPTY, catchError } from 'rxjs';
import { CartService } from 'src/app/cart/cart.service';

@Component({
    selector: 'pm-product-detail',
    templateUrl: './product-detail.component.html',
    standalone: true,
    imports: [AsyncPipe ,NgIf, NgFor, CurrencyPipe]
})
export class ProductDetailComponent {

  // Just enough here for the template to compile
  @Input() productId: number = 0;
  errorMessage = this.productService.productError;

  // Product to display
/*
  product$ = this.productService.product$
  .pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY
    })
  )
 */
product = this.productService.product;

  constructor(private productService : ProductService , private cartService : CartService) {
      
  }

  // Set the page title
 // pageTitle = this.product ? `Product Detail for: ${this.product.productName}` : 'Product Detail';
 pageTitle = computed(() => (
 this.product() 
 ? `Product Detail for: ${this.product()?.productName}` 
 : 'Product Detail'))
  addToCart(product: Product) {
  this.cartService.addToCart(product);
  }
}
