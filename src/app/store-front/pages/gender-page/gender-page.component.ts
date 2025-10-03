import { ChangeDetectionStrategy, Component, computed, effect, inject, resource } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { ProductCardComponent } from '@app/products/components/product-card/product-card.component';
import { Product, ProductsResponse } from '@app/products/interfaces/product.interface';
import { ProductsService } from '@app/products/services/products.service';

@Component({
  selector: 'app-gender-page',
  imports: [ProductCardComponent],
  templateUrl: './gender-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenderPageComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);

  // Obtener el género de los parámetros de la ruta
  gender = toSignal(this.route.params.pipe(map(({gender}) => gender || '')));

  // Resource para cargar productos filtrados por género
  productsResource = resource<ProductsResponse, {}>({
    loader: () => {
      const currentGender = this.gender() || '';
      return firstValueFrom(
        this.productsService.getsProducts({
          gender: currentGender,
          limit: 20,
          offset: 0
        })
      );
    }
  });

  // Computed signals para datos derivados
  products = computed(() => this.productsResource.value()?.products ?? []);
  totalProducts = computed(() => this.productsResource.value()?.count ?? 0);
  isLoading = computed(() => this.productsResource.isLoading());
  hasError = computed(() => !!this.productsResource.error());
  isEmpty = computed(() => this.products().length === 0 && !this.isLoading());

  // Effect para recargar productos cuando cambie el género
  constructor() {
    effect(() => {
      // Cada vez que cambie el gender signal, recargar el resource
      const currentGender = this.gender();
      this.productsResource.reload();
    });
  }

  // Getter para mostrar el género formateado
  get genderTitle(): string {
    const currentGender = this.gender();
    switch(currentGender) {
      case 'men': return 'Hombres';
      case 'women': return 'Mujeres';
      case 'kid': return 'Niños';
      case 'unisex': return 'Unisex';
      default: return 'Productos';
    }
  }

}
