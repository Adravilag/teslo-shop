import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, Size } from '@app/products/interfaces/product.interface';
import { ProductCarouselComponent } from '@app/products/components/product-carousel/product-carousel.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '@app/utils/form-utils';
import { FormErrorLabelComponent } from '@app/shared/components/form-error-label/form-error-label.component';
import { ProductsService } from '@app/products/services/products.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, ProductCarouselComponent, ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './product-details-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailsComponent implements OnInit {
  product = input.required<Product>();

  // Output para notificar al padre cuando se actualiza el producto
  productUpdated = output<Product>();

  router = inject(Router);
  fb = inject(FormBuilder);

  productService = inject(ProductsService);
  wasSaved = signal(false);
  imageFileList: FileList | undefined = undefined;
  tempImages = signal<string[]>([]);

  // Array para rastrear imágenes eliminadas que deben borrarse del backend
  deletedImages = signal<string[]>([]);

  imagesToCarousel = computed(() => {
    // Filtrar las imágenes eliminadas de las imágenes del producto
    const deletedImagesList = this.deletedImages();
    const filteredProductImages = this.product().images.filter(
      img => !deletedImagesList.includes(img)
    );

    // Combinar con las imágenes temporales (nuevas)
    const currentProductImages = [...filteredProductImages, ...this.tempImages()];
    return currentProductImages;
  });

  sizes: Size[] = [Size.XS, Size.S, Size.M, Size.L, Size.XL, Size.XXL];

  ngOnInit(): void {
    this.setFormValue(this.product());
  }

  setFormValue(formLike: Partial<Product>) {
    this.productForm.reset(this.product() as any);
    this.productForm.patchValue(formLike as any);
    // ensure tags control is a comma separated string (the input expects a string)
    this.productForm.patchValue({ tags: formLike.tags?.join(', ') } as any);
  }

  productForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    sizes: [[] as string[]],
    images: [[] as string[]],
    tags: [''],
    gender: ['men', [Validators.required, Validators.pattern('men|women|kid|unisex')]],
  });

  private normalizeTagsFromForm(tags: any): string[] {
    if (Array.isArray(tags)) return tags;
    return String(tags || '')
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((t) => t.length > 0);
  }

  private buildProductFromForm(): Partial<Product> | null {
    const isValid = this.productForm.valid;
    this.productForm.markAllAsTouched();
    if (!isValid) return null;

    const formValue = this.productForm.value;

    return {
      ...(formValue as any),
      tags: this.normalizeTagsFromForm(formValue.tags),
    };
  }

  async onSubmit() {
    const productLike = this.buildProductFromForm();
    if (!productLike) return;

    if (this.product().id === 'new') {
      await firstValueFrom(this.productService.createProduct(productLike, this.imageFileList));
      this.router.navigate(['/admin/products']);
    } else {
      // Primero eliminar las imágenes marcadas para eliminación
      const imagesToDelete = this.deletedImages();
      for (const imageFileName of imagesToDelete) {
        try {
          await firstValueFrom(this.productService.deleteFile(imageFileName));
          console.log(`Imagen ${imageFileName} eliminada del backend`);
        } catch (error) {
          console.error(`Error al eliminar imagen ${imageFileName}:`, error);
        }
      }

      // Actualizar las imágenes del producto (filtrar las eliminadas)
      const currentImages = this.product().images.filter(
        img => !imagesToDelete.includes(img)
      );

      const updatedProductLike = {
        ...productLike,
        images: currentImages // Las nuevas imágenes se agregarán en updateProduct
      };

      const updatedProduct = await firstValueFrom(
        this.productService.updateProduct(updatedProductLike, this.product().id, this.imageFileList)
      );

      // Limpiar las imágenes eliminadas y temporales
      this.deletedImages.set([]);
      this.clearFileInput();

      // Emitir el producto actualizado al componente padre
      this.productUpdated.emit(updatedProduct);

      this.wasSaved.set(true);
      setTimeout(() => this.wasSaved.set(false), 3000);
    }
  }

  updateProduct() {
    const productLike = this.buildProductFromForm();
    if (!productLike) return;
  }

  onSizeClicked(size: string) {
    const currentSizes = this.productForm.value.sizes ?? [];
    if (currentSizes.includes(size)) {
      currentSizes.splice(currentSizes.indexOf(size), 1);
    } else {
      currentSizes.push(size);
    }
    this.productForm.patchValue({ sizes: currentSizes });
  }

  onFilesChanged(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    this.imageFileList = fileList ? fileList : undefined;
    const imagesUrls = Array.from(this.imageFileList ?? []).map((file) => URL.createObjectURL(file));
    this.tempImages.set(imagesUrls);
  }

  onImageDeleted(event: {imageFileName: string, imageIndex: number}) {
    console.log('Imagen eliminada:', event);

    const productImages = this.product().images;
    const tempImages = this.tempImages();

    // Si la imagen eliminada es una imagen existente del producto, agregarla a la lista de eliminadas
    if (productImages.includes(event.imageFileName)) {
      const currentDeleted = this.deletedImages();
      this.deletedImages.set([...currentDeleted, event.imageFileName]);
    }
    // Si la imagen eliminada es una imagen temporal (URL blob), removerla de tempImages
    else if (event.imageFileName.startsWith('blob:')) {
      const updatedTempImages = tempImages.filter(img => img !== event.imageFileName);
      this.tempImages.set(updatedTempImages);

      // Reconstruir el FileList sin el archivo eliminado
      this.rebuildFileListWithoutIndex(event.imageIndex, productImages.length);
    }
  }

  private rebuildFileListWithoutIndex(imageIndexInCarousel: number, productImagesCount: number) {
    if (!this.imageFileList) return;

    // Calcular el índice real en la lista de archivos temporales
    const tempImageIndex = imageIndexInCarousel - productImagesCount;

    if (tempImageIndex >= 0 && tempImageIndex < this.imageFileList.length) {
      // Convertir FileList a Array, remover el archivo y crear nuevo FileList
      const filesArray = Array.from(this.imageFileList);
      filesArray.splice(tempImageIndex, 1);

      // Crear un nuevo DataTransfer para reconstruir FileList
      const dt = new DataTransfer();
      filesArray.forEach(file => dt.items.add(file));

      this.imageFileList = dt.files;

      // Actualizar el input file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.files = this.imageFileList;
      }
    }
  }

  private clearFileInput() {
    // Limpiar el input de archivos
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.imageFileList = undefined;
    this.tempImages.set([]);
  }
}
