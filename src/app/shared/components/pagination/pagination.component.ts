import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagination',
  imports: [RouterLink],
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {

  pages = input<number>(0);
  currentPage = input<number>(1);

  // Motivo del cambio de signal a linkedSignal:
  // - linkedSignal permite que el valor se actualice automáticamente cuando la entrada cambia.
  // - Si usáramos signal(this.currentPage), el valor se fijaría en el momento de la creación y no reflejaría cambios posteriores.
  // - linkedSignal es ideal para inputs que pueden cambiar dinámicamente.
  activePage = linkedSignal(this.currentPage);

  getPagesList = computed(() => {
    return Array.from({ length: this.pages() }, (_, i) => i + 1);
  });

}
