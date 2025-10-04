import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '@app/products/interfaces/product.interface';
import { ProductsService } from '@app/products/services/products.service';
import { firstValueFrom } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { ProductCarouselComponent } from '@app/products/components/product-carousel/product-carousel.component';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-page',
  imports: [ProductCarouselComponent, DecimalPipe],
  templateUrl: './product-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPageComponent {

  routes = inject(ActivatedRoute);
  productService = inject(ProductsService);

  productIdSlug = this.routes.snapshot.params['slug'] || this.routes.snapshot.params['idSlug'] || '';

  productResource = rxResource<Product, {}>({
    params: () => ({}),
    stream: () => {
      return this.productService.getProductBySlug(this.productIdSlug);
    }
  });

}
