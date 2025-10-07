import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductsResponse } from '@app/products/interfaces/product.interface';
import { ProductsService } from '@app/products/services/products.service';
import { map } from 'rxjs';
import { ProductDetailsComponent } from './product-details/product-details-page';

@Component({
  selector: 'app-product-admin-page',
  imports: [ProductDetailsComponent],
  templateUrl: './product-admin-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAdminPageComponent {
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  productService = inject(ProductsService);

  productId = toSignal(this.activatedRoute.params.pipe(map((params) => params['id'])));

  productResource = rxResource<Product, { id: string | undefined }>({
    params: () => ({ id: this.productId() }),
    stream: ({ params }) => {
      if (!params.id) throw new Error('Product ID is required');
      return this.productService.getProductById(params.id);
    }
  });

  redirectEffect = effect(() => {
    if (this.productResource.error()) {
      this.router.navigateByUrl('/admin/products');
    }
  });

  onProductUpdated(updatedProduct: Product) {
    // Forzar la recarga del recurso actualizando el caché del servicio
    this.productService.updateProductCache(updatedProduct);

    // Recargar el recurso para reflejar los cambios
    this.productResource.reload();
  }

}
