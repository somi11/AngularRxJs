import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Just enough here for the code to compile
  private productsUrl = 'api/products';
  constructor(private http: HttpClient) {}

  getProducts() : Observable<Product []> {
    return this.http.get<Product []>(this.productsUrl)
       .pipe(
        tap(() => console.log('In http get pipeline'))
       ) 
  }

  getProduct(id : number) : Observable<Product> {
    const productUrl = this.productsUrl + '/' + id
    return this.http.get<Product> (productUrl)
    .pipe(
      tap(() => console.log('In http get pipeline'))
    )
  }
}
