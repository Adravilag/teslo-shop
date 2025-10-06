import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product, ProductsResponse } from '../interfaces/product.interface';
import { delay, Observable, of, tap } from 'rxjs';

const baseUrl = 'http://localhost:3000/api';

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  private productsCache = new Map<string, ProductsResponse>();
  private productCache = new Map<string, Product>();

  getsProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 9, offset = 0, gender = '' } = options;

    // Crear una clave única para la combinación de parámetros
    // Sirve para cachear las respuestas y evitar llamadas repetidas
    const key = `limit=${limit}&offset=${offset}&gender=${gender}`;
    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }

    return this.http.get<ProductsResponse>(`${baseUrl}/products`, {
      params: { limit, offset, gender },
    }).pipe(
      tap((response) => {
        this.productsCache.set(key, response);
      })
    );
  }

  getProductBySlug(slug: string): Observable<Product> {
    if (this.productCache.has(slug)) {
      return of(this.productCache.get(slug)!);
    }
    return this.http.get<Product>(`${baseUrl}/products/${slug}`).pipe(
      tap((product) => {
        this.productCache.set(slug, product);
      })
    );
  }

  getProductById(id: string): Observable<Product> {
    if (this.productCache.has(id)) {
      return of(this.productCache.get(id)!);
    }
    return this.http.get<Product>(`${baseUrl}/products/${id}`).pipe(
      tap((product) => {
        this.productCache.set(id, product);
      })
    );
  }

  getProductsByGender(gender: string): Observable<ProductsResponse> {
    return this.getsProducts({ gender, limit: 20, offset: 0 });
  }

}
