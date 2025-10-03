import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { ProductImagePipe } from '@app/products/pipes/product-image.pipe';

import { Swiper } from 'swiper/bundle';
import 'swiper/css/bundle';

@Component({
  selector: 'product-carousel',
  imports: [ProductImagePipe],
  templateUrl: './product-carousel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: [
    `
      .swiper {
        width: 100%;
        height: 500px;
        --swiper-navigation-color: #fff;
        --swiper-pagination-color: #fff;
      }
      .swiper-slide {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .swiper-slide img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `,
  ],
})
export class ProductCarouselComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const element = this.swiperDiv()?.nativeElement;
    if (!element) {
      console.error('Swiper element not found');
      return;
    }

    // Verificar que hay imágenes
    const images = this.images();
    if (!images || images.length === 0) {
      console.warn('No images provided for carousel');
      return;
    }

    try {
      const swiper = new Swiper(element, {
        direction: 'horizontal', // Cambiar a horizontal para mejor UX
        loop: images.length > 1, // Solo hacer loop si hay más de una imagen
        autoplay: images.length > 1 ? {
          delay: 3000,
          disableOnInteraction: false,
        } : false,

        // Pagination
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },

        // Navigation arrows
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },

        // Scrollbar
        scrollbar: {
          el: '.swiper-scrollbar',
          draggable: true,
        },
      });

      console.log('Swiper initialized successfully', swiper);
    } catch (error) {
      console.error('Error initializing Swiper:', error);
    }
  }

  images = input.required<string[]>();
  swiperDiv = viewChild.required<ElementRef<HTMLDivElement>>('swiperDiv');
}
