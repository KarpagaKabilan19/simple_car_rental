import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

interface User {
  username: string;
  password: string;
  role: 'user' | 'admin';
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  // Mock user database (you can expand this as needed)
  private users: User[] = [
    { username: 'user1', password: 'password1', role: 'user' },
    { username: 'user2', password: 'password2', role: 'user' },
    { username: 'admin1', password: 'adminpass1', role: 'admin' },
    { username: 'admin2', password: 'adminpass2', role: 'admin' }
  ];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Redirect to appropriate dashboard if already logged in
      if (localStorage.getItem('isLoggedIn')) {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'user') {
          this.router.navigate(['/user']);
        } else if (userRole === 'admin') {
          this.router.navigate(['/admin']);
        }
      }
    }
  }

  onLogin() {
    if (isPlatformBrowser(this.platformId)) {
      // Find user in the mock database
      const user = this.users.find(
        u => u.username === this.username && u.password === this.password
      );

      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('username', user.username); // Store username for later use
        if (user.role === 'user') {
          this.router.navigate(['/user']);
        } else if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        }
      } else {
        this.errorMessage = 'Invalid username or password.';
      }
    }
  }
}