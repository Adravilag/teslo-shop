import { ChangeDetectionStrategy, Component, inject, OnInit, resource, signal } from '@angular/core';
import { ProductCardComponent } from '@app/products/components/product-card/product-card.component';
import { ProductsService } from '../../../products/services/products.service';
import { Product, ProductsResponse } from '@app/products/interfaces/product.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home-page',
  imports: [ProductCardComponent],
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {

  productsService = inject(ProductsService);
  productsResource = resource<ProductsResponse, {}>({
    loader: () => firstValueFrom(this.productsService.getsProducts({ limit: 12, offset: 0 }))
  });

}
