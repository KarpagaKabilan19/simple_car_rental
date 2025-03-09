import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { CarService, Car } from '../car.service';

@Component({
  selector: 'app-car-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './car-status.component.html',
  styleUrls: ['./car-status.component.css']
})
export class CarStatusComponent implements OnInit {
  cars: Car[] = [];

  constructor(
    private router: Router,
    private carService: CarService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.carService.getCars().subscribe(cars => {
      this.cars = cars;
    });

    if (isPlatformBrowser(this.platformId)) {
      if (!localStorage.getItem('isLoggedIn')) {
        this.router.navigate(['/login']);
      }
    }
  }

  hasPendingRequest(carId: number): boolean {
    return this.carService.hasPendingRequest(carId);
  }
}