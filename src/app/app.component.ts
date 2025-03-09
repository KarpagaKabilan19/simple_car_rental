import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Car Rental App';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('isLoggedIn');
    }
    return false;
  }

  isUser(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('userRole') === 'user';
    }
    return false;
  }

  isAdmin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('userRole') === 'admin';
    }
    return false;
  }
}