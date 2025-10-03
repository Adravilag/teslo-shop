import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product, ProductsResponse } from '../interfaces/product.interface';
import { Observable, tap } from 'rxjs';

const baseUrl = 'http://localhost:3000/api';

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  getsProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 9, offset = 0, gender = '' } = options;
    return this.http.get<ProductsResponse>(`${baseUrl}/products`, {
      params: { limit, offset, gender },
    });
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${baseUrl}/products/${slug}`);
  }

  getProductsByGender(gender: string): Observable<ProductsResponse> {
    return this.getsProducts({ gender, limit: 20, offset: 0 });
  }

}
