import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '@app/products/interfaces/product.interface';
import { ProductImagePipe } from '@app/products/pipes/product-image.pipe';
import { ProductsService } from '@app/products/services/products.service';

@Component({
  selector: 'product-card',
  imports: [RouterLink, SlicePipe, ProductImagePipe],
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {

  product = input.required<Product>();
  productsService = inject(ProductsService);

}
