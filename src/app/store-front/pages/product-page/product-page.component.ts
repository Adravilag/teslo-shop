import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '@app/products/interfaces/product.interface';
import { ProductsService } from '@app/products/services/products.service';
import { firstValueFrom } from 'rxjs';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { ProductCarouselComponent } from '@app/products/components/product-carousel/product-carousel.component';

@Component({
  selector: 'app-product-page',
  imports: [ProductCarouselComponent, DecimalPipe, SlicePipe],
  templateUrl: './product-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPageComponent {

  routes = inject(ActivatedRoute);
  productService = inject(ProductsService);

  productIdSlug = this.routes.snapshot.params['slug'] || this.routes.snapshot.params['idSlug'] || '';

  productResource = resource<Product, {}>({
    loader: () => firstValueFrom(this.productService.getProductBySlug(this.productIdSlug))
  });

}
