import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-tasks',
  imports: [],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export default class Tasks {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.user;

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
