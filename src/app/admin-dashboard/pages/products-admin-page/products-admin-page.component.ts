import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductTableComponent } from "@app/products/components/product-table/product-table.component";
import { ProductsService } from '@app/products/services/products.service';
import { PaginationService } from '@app/shared/components/pagination/pagination.service';
import { PaginationComponent } from "@app/shared/components/pagination/pagination.component";

@Component({
  selector: 'app-products-admin-page',
  imports: [ProductTableComponent, PaginationComponent],
  templateUrl: './products-admin-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsAdminPageComponent {

  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);
  productsPerPage = signal(10);

  productsResource = rxResource({
    params: () => ({ page: this.paginationService.currentPage() - 1, limit: this.productsPerPage() }),
    stream: ({ params }) => {
      return this.productsService.getsProducts({
        offset: params.page * 9,
        limit: params.limit
      });
    },
  });

}
