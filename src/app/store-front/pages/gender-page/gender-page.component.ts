import { ChangeDetectionStrategy, Component, computed, effect, inject, resource } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { ProductCardComponent } from '@app/products/components/product-card/product-card.component';
import { Product, ProductsResponse } from '@app/products/interfaces/product.interface';
import { ProductsService } from '@app/products/services/products.service';
import { PaginationComponent } from "@app/shared/components/pagination/pagination.component";
import { PaginationService } from '@app/shared/components/pagination/pagination.service';

@Component({
  selector: 'app-gender-page',
  imports: [ProductCardComponent, PaginationComponent],
  templateUrl: './gender-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenderPageComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  readonly paginationService = inject(PaginationService);

  // Obtener el género de los parámetros de la ruta
  gender = toSignal(this.route.params.pipe(map(({gender}) => gender || '')));

  productsResource = rxResource({
    // Incluir 'gender' en los params para que el resource se reevalúe
    params: () => ({ page : this.paginationService.currentPage() - 1, gender: this.gender() }),
    stream: ({ params }) => { // de Loader a Stream
      return this.productsService.getsProducts({
        gender: params.gender,
        offset : params.page * 9,
        limit : 9
      });
    },
  });

}
