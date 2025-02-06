import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, filter, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product, Result } from './product';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Just enough here for the code to compile
  private productsUrl = 'api/products';
  constructor(private http: HttpClient , private errorService : HttpErrorService , private reviewService : ReviewService) {}
 //private productSelectedSubject = new BehaviorSubject<number | undefined >(undefined);
 //readonly productSelected$  = this.productSelectedSubject.asObservable();
selectedProductId = signal<number | undefined>(undefined);


 private productsResults$ = this.http.get<Product []>(this.productsUrl)
 .pipe(
  map(p => ({data : p} as Result<Product[]>)),
  tap(p => console.log(JSON.stringify(p))),
  shareReplay(1),
  catchError( err => of({data : []
     , error : this.errorService.formatError(err) } as Result<Product[]> )
  )
 )

 private productsResult = toSignal(this.productsResults$ , {initialValue : ({data : []} as Result<Product[]>)})

products = computed(() => this.productsResult().data)
productError = computed(() => this.productsResult().error)
/*  
products = computed(() => {
    try {
      return toSignal(this.products$ , {initialValue : [] as  Product []})();
    } catch(err) {
      return [] as Product[];
    }
  } )
*/



readonly product$ = toObservable(this.selectedProductId)
.pipe(
  filter(Boolean),
  switchMap(id => {
    const productUrl = this.productsUrl + '/' + id ;
    return  this.http.get<Product>(productUrl)
    .pipe(
      switchMap(product => this.getProductWithReviews(product)),
      catchError(err => this.handleError(err))
    )
  })
)

/*
readonly product$ = combineLatest(
  [
    this.productSelected$,
    this.products$
  ]
).pipe(
  map(([selectedProductId , products]) =>
  products.find( product => product.id  === selectedProductId)
  ),
  filter(Boolean),
  switchMap(product => this.getProductWithReviews(product)),
  catchError(err => this.handleError(err))
)

/*
  getProduct(id : number) : Observable<Product> {
    const productUrl = this.productsUrl + '/' + id
    return this.http.get<Product> (productUrl)
    .pipe(
      tap(() => console.log('In http get pipeline')),
      switchMap((product) => this.getProductWithReviews(product)),
      catchError(err => this.handleError(err))
    )
  }
*/
  productSelected(selectedProductId : number) : void {
   // this.productSelectedSubject.next(selectedProductId);
    this.selectedProductId.set(selectedProductId);
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
