import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import { ProductImagePipe } from '@app/products/pipes/product-image.pipe';
import { ProductsService } from '../../services/products.service';

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
      .swiper-slide {
        position: relative;
      }
      .delete-image-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10;
        background-color: rgba(0, 0, 0, 0.7);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        opacity: 0.8;
      }
      .delete-image-btn:hover {
        background-color: rgba(220, 38, 38, 0.9);
        opacity: 1;
        transform: scale(1.1);
      }
      .delete-image-btn:active {
        transform: scale(0.95);
      }
      .delete-image-btn svg {
        width: 20px;
        height: 20px;
      }
    `,
  ],
})
export class ProductCarouselComponent implements AfterViewInit, OnChanges {
  images = input.required<string[]>();
  productId = input.required<string>();
  swiperDiv = viewChild.required<ElementRef<HTMLDivElement>>('swiperDiv');
  swiper: Swiper | undefined = undefined;

  // Output para comunicar eliminación de imagen al componente padre
  imageDeleted = output<{imageFileName: string, imageIndex: number}>();

  // Inyectar dependencias
  private cdr = inject(ChangeDetectorRef);

  // Signal local para controlar las imágenes y forzar re-render
  localImages = signal<string[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    // Actualizar el signal local cuando cambian las imágenes
    if (changes['images']) {
      this.localImages.set(this.images());
    }

    if (changes['images']?.firstChange) {
      return;
    }

    if (!this.swiper) {
      return;
    }

    this.swiper.destroy(true, true);

    const paginationElement = this.swiperDiv()?.nativeElement.querySelector('.swiper-pagination');

    if (paginationElement) {
      paginationElement.innerHTML = '';
    }

    setTimeout(() => {
      this.swiperInit();
    }, 100);
  }

  ngAfterViewInit(): void {
    // Inicializar el signal local con las imágenes iniciales
    this.localImages.set(this.images());
    this.swiperInit();
  }

  swiperInit() {
    const element = this.swiperDiv()?.nativeElement;
    if (!element) {
      console.error('Swiper element not found');
      return;
    }

    // Verificar que hay imágenes (usar localImages para mejor control)
    const images = this.localImages();
    if (!images || images.length === 0) {
      console.warn('No images provided for carousel');
      return;
    }

    try {
      this.swiper = new Swiper(element, {
        direction: 'horizontal', // Cambiar a horizontal para mejor UX
        loop: images.length > 1, // Solo hacer loop si hay más de una imagen
        autoplay:
          images.length > 1
            ? {
                delay: 3000,
                disableOnInteraction: false,
              }
            : false,

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

      console.log('Swiper initialized successfully', this.swiper);
    } catch (error) {
      console.error('Error initializing Swiper:', error);
    }
  }

deleteImage(imageIndex: number) {
  const images = this.localImages();

  if (imageIndex >= 0 && imageIndex < images.length) {
    const imageFileName = images[imageIndex];

    // Eliminar localmente de inmediato para feedback visual
    const updatedImages = images.filter((_, index) => index !== imageIndex);
    this.localImages.set(updatedImages);

    // Emitir evento al componente padre para que maneje la eliminación
    this.imageDeleted.emit({ imageFileName, imageIndex });

    // Forzar detección de cambios
    this.cdr.detectChanges();

    // Reinicializar Swiper con las nuevas imágenes
    if (this.swiper) {
      this.swiper.destroy(true, true);
      setTimeout(() => {
        this.swiperInit();
      }, 100);
    }
  }
}

}
