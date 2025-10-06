import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Product } from '@app/products/interfaces/product.interface';
import { ProductImagePipe } from "../../pipes/product-image.pipe";
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { PaginationService } from '../../../shared/components/pagination/pagination.service';

@Component({
  selector: 'app-product-table',
  imports: [ProductImagePipe, RouterLink, CurrencyPipe],
  templateUrl: './product-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTableComponent {
  products = input.required<Product[]>();
  paginationService = inject(PaginationService);
}
