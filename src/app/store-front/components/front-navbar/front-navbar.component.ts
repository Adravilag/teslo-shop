import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@app/auth/services/auth.service';

@Component({
  selector: 'front-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './front-navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrontNavbarComponent {
  authService = inject(AuthService);
}
