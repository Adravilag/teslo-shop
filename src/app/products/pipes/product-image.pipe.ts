import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@environments/environment.development';

const baseUrl = environment.baseUrl;

@Pipe({
  name: 'productImage',
  standalone: true
})

export class ProductImagePipe implements PipeTransform {
  transform(value: null | string | string[], ...args: any[]): string {

    if (!value || (Array.isArray(value) && value.length === 0) || value === null) {
      return '/assets/images/product-placeholder.svg';
    }

    const imagePath = Array.isArray(value) ? value[0] : value;

    if (!imagePath || imagePath.trim() === '') {
      return '/assets/images/product-placeholder.svg';
    }

    return `${baseUrl}/files/product/${imagePath}`;
  }
}
