import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Just enough here for the code to compile
  private productsUrl = 'api/products';
  constructor(private http: HttpClient , private errorService : HttpErrorService , private reviewService : ReviewService) {}
 readonly products$ = this.http.get<Product []>(this.productsUrl)
 .pipe(
  tap(p => console.log(JSON.stringify(p))),
  shareReplay(1),
  catchError( err => this.handleError(err)
  )
 ) 


  getProduct(id : number) : Observable<Product> {
    const productUrl = this.productsUrl + '/' + id
    return this.http.get<Product> (productUrl)
    .pipe(
      tap(() => console.log('In http get pipeline')),
      switchMap((product) => this.getProductWithReviews(product)),
      catchError(err => this.handleError(err))
    )
  }
private getProductWithReviews(product : Product) : Observable<Product> {
 if(product.hasReviews) {
  return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
  .pipe(
     map(reviews =>({...product , reviews} as Product))
  )
 } else {
  return of(product)
 }

}

  private handleError(err: HttpErrorResponse) : Observable<never> {
   const formattedMessage = this.errorService.formatError(err)
  return throwError(() => formattedMessage)
  }
}
