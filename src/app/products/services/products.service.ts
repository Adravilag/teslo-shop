import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Gender, Product, ProductsResponse } from '../interfaces/product.interface';
import { catchError, delay, Observable, of, tap, throwError } from 'rxjs';
import { User } from '@app/auth/interfaces/user.interface';

const baseUrl = 'http://localhost:3000/api';

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User,
};

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

    return this.http
      .get<ProductsResponse>(`${baseUrl}/products`, {
        params: { limit, offset, gender },
      })
      .pipe(
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
    if (id === 'new') {
      return of(emptyProduct).pipe(delay(1000));
    }
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

  updateProduct(productLike: Partial<Product>, productId: string): Observable<Product> {
    return this.http.patch<Product>(`${baseUrl}/products/${productId}`, productLike).pipe(
      tap((updatedProduct) => {
        this.updateProductCache(updatedProduct);
      })
    );
  }

  updateProductCache(product: Product) {
    const productId = product.id;
    this.productCache.set(productId, product);

    // this.productsCache.forEach( productsResponse => productsResponse.products.map(currentProduct =>
    //   currentProduct.id === productId ? product : currentProduct
    // ));

    this.productsCache.forEach((productsResponse) => {
      const index = productsResponse.products.findIndex((p) => p.id === productId);
      // If found, update the product in place
      if (index !== -1) {
        productsResponse.products[index] = product;
      }
    });
  }

  createProduct(productLike: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${baseUrl}/products`, productLike).pipe(
      tap((newProduct) => {
        this.addProductToCache(newProduct);
      }),
      catchError((error) => {
        console.error('❌ Error al crear producto:', error);
        console.error('📋 Detalles del error:', error.error);
        return throwError(() => error);
      })
    );
  }

  addProductToCache(product: Product) {
    // Agregar al cache individual
    this.productCache.set(product.id, product);
    // Agregar a las listas existentes en productsCache
    this.productsCache.forEach((productsResponse) => {
      // Solo agregarlo si no existe ya en la lista
      const exists = productsResponse.products.some((p) => p.id === product.id);
      if (!exists) {
        // Agregar al inicio de la lista (más reciente primero)
        productsResponse.products.unshift(product);
        // Actualizar el total
        productsResponse.count += 1;
      }
    });
  }
}
