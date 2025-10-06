import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/auth/services/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule],
  templateUrl: './register-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {

  fb = inject(FormBuilder);
  hasError = signal(false);
  isPosting = signal(false);

  authService = inject(AuthService);
  router = inject(Router);

  registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.hasError.set(true);
      setTimeout(() => this.hasError.set(false), 2000);
      return;
    }
    const { fullName = '', email = '', password = '' } = this.registerForm.value;
    this.authService.register(fullName, email, password).subscribe({next: (user: any | null) => {
        if (user) {
          this.router.navigateByUrl('/');
          return;
        }
        this.hasError.set(true);
        setTimeout(() => this.hasError.set(false), 2000);
      },
      error: () => {
        this.hasError.set(true);
        setTimeout(() => this.hasError.set(false), 2000);
      },
    });
  }
 }
