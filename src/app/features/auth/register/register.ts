import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {ThemeService} from '../../../core/services/theme.service';
import {LucideAngularModule, Sun, Moon} from 'lucide-angular';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export default class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  theme = inject(ThemeService);

  readonly Sun = Sun;
  readonly Moon = Moon;

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { name, email, password } = this.form.getRawValue();
    const { error } = await this.auth.signUp(email!, password!, name!);

    this.loading.set(false);

    if (error) {
      this.error.set(
        error.message.includes('already registered')
          ? 'Ese email ya está registrado.'
          : 'No se pudo crear la cuenta. Inténtalo de nuevo.'
      );
      return;
    }

    this.router.navigate(['/tasks']);
  }
}
