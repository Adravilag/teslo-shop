import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Injectable({providedIn: 'root'})
export class PaginationService {

  activatedRoute = inject(ActivatedRoute);
  currentPage = toSignal(
    this.activatedRoute.queryParams.pipe(
      // Extraer el parámetro 'page' y convertirlo a número, por defecto 1
      map((params) => (params['page'] ? parseInt(params['page'], 10) : 1)),
      map((page) => (page > 0 ? page : 1))
    ),
    { initialValue: 1 } // Valor inicial mientras se obtiene el valor real
  );
}
