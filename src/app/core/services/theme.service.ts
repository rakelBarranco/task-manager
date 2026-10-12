import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<'light' | 'dark'>('light');

  constructor() {
    let saved: 'light' | 'dark' | null = null;
    try {
      saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    } catch {}

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    this.apply(saved ?? (prefersDark ? 'dark' : 'light'));
  }

  toggle() {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: 'light' | 'dark') {
    this.theme.set(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }
}
