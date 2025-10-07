import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Gender, Product, ProductsResponse } from '../interfaces/product.interface';
import { catchError, delay, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { User } from '@app/auth/interfaces/user.interface';
import { environment } from '@environments/environment.development';

const baseUrl = environment.baseUrl;

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

  updateProduct(
    productLike: Partial<Product>,
    productId: string,
    imageFileList?: FileList
  ): Observable<Product> {
    const currentImages = productLike.images ?? [];
    return this.uploadImages(imageFileList).pipe(
      map((imageUrls) => {
        const updatedProduct = {
          ...productLike,
          images: [...currentImages, ...imageUrls.map((url: any) => url.fileName)],
        };
        return updatedProduct;
      }),
      switchMap((updatedProduct: Partial<Product>) => {
        return this.http.patch<Product>(`${baseUrl}/products/${productId}`, updatedProduct).pipe(
          tap((updatedProduct) => {
            this.updateProductCache(updatedProduct);
          })
        );
      })
    );

    // return this.http.patch<Product>(`${baseUrl}/products/${productId}`, productLike).pipe(
    //   tap((updatedProduct) => {
    //     this.updateProductCache(updatedProduct);
    //   })
    // );
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

  createProduct(productLike: Partial<Product>, imageFileList?: FileList): Observable<Product> {
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

  uploadImages(images?: FileList): Observable<string[]> {
    if (!images || images.length === 0) {
      return of([]);
    }
    const uploadObservables = Array.from(images).map((imageFile) => {
      return this.uploadImage(imageFile);
    });
    // Usar forkJoin para esperar a que todas las subidas terminen
    return forkJoin(uploadObservables).pipe(
      tap((imageUrls) => {
        console.log('✅ Imágenes subidas:', imageUrls);
      })
    );
  }

  uploadImage(imageFile: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', imageFile);
    return this.http.post<string>(`${baseUrl}/files/product`, formData).pipe(
      catchError((error) => {
        console.error('❌ Error al subir imagen:', error);
        return throwError(() => error);
      })
    );
  }

  deleteFile(imageFileName: string): Observable<any> {
    return this.http.delete(`${baseUrl}/files/product/${imageFileName}`).pipe(
      catchError((error) => {
        console.error('Error al eliminar archivo en el servidor:', error); // Aquí puedes decidir si quieres que el error de eliminación del archivo // detenga toda la operación o simplemente loguee el error. // Por simplicidad, lo dejaremos pasar para que no bloquee la actualización del producto.
        return of(null);
      })
    );
  }

  deleteImage(
    productId: string,
    imageFileName: string,
    currentImages: string[]
  ): Observable<Product> {
    // 1. Filtra la lista de imágenes para quitar la que se desea eliminar.
    const updatedImages = currentImages.filter((img) => img !== imageFileName);

    // 2. Prepara el objeto parcial para la actualización.
    const updatedProductLike: Partial<Product> = { images: updatedImages };

    // 3. Primero eliminar el archivo físico del backend, luego actualizar el producto
    return this.deleteFile(imageFileName).pipe(
      switchMap(() => {
        // 4. Actualizar el producto sin las imágenes eliminadas
        return this.updateProduct(updatedProductLike, productId);
      }),
      tap(() => {
        console.log(`Imagen ${imageFileName} eliminada completamente del producto ${productId}.`);
      }),
      catchError((error) => {
        console.error(`Error al eliminar imagen ${imageFileName}:`, error);
        return throwError(() => error);
      })
    );
  }
}
