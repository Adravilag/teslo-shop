import { PaginationService } from './../../../shared/components/pagination/pagination.service';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ProductCardComponent } from '@app/products/components/product-card/product-card.component';
import { ProductsService } from '../../../products/services/products.service';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home-page',
  imports: [ProductCardComponent, PaginationComponent],
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {

  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);

  productsResource = rxResource({
    params: () => ({ page : this.paginationService.currentPage() - 1 }), // de request a Params
    stream: ({ params }) => { // de Loader a Stream
      return this.productsService.getsProducts({
        offset : params.page * 9,
        limit : 9
      });
    },
  });

}
