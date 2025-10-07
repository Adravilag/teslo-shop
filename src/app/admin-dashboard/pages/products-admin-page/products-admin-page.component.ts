import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductTableComponent } from "@app/products/components/product-table/product-table.component";
import { ProductsService } from '@app/products/services/products.service';
import { PaginationService } from '@app/shared/components/pagination/pagination.service';
import { PaginationComponent } from "@app/shared/components/pagination/pagination.component";
import { RouterLink } from '@angular/router';
import { Product } from '@app/products/interfaces/product.interface';

@Component({
  selector: 'app-products-admin-page',
  imports: [ProductTableComponent, PaginationComponent, RouterLink],
  templateUrl: './products-admin-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
  :host {
  display: block;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.container {
  max-width: 100%;
  box-sizing: border-box;
}
`,
  ],
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
