import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
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

  router = inject(Router);
  fb = inject(FormBuilder);

  productService = inject(ProductsService);
  wasSaved = signal(false);

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
    sizes: [['']],
    images: [[]],
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
      const product = await firstValueFrom(this.productService.createProduct(productLike));
      this.router.navigate(['/admin/products']);
    } else {
      await firstValueFrom(
        this.productService.updateProduct(productLike, this.product().id)
      );
      this.wasSaved.set(true);
      setTimeout(() => this.wasSaved.set(false), 3000);
    }
  }

  updateProduct() {
    const productLike = this.buildProductFromForm();
    if (!productLike) return;

    console.log({ productLike });
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
}
