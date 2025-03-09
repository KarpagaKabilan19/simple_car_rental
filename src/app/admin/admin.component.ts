import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { CarService, Car, TravelRequest } from '../car.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  cars: Car[] = [];
  newCar: Car = { id: 0, name: '', type: '', pricePerDay: 0, image: '', available: true, rented: false };
  newCarImage: string | null = null;
  travelRequests: TravelRequest[] = [];
  filteredTravelRequests: TravelRequest[] = [];
  selectedCarId: number | null = null;
  selectedCarName: string = '';
  username: string = '';

  constructor(
    private router: Router,
    public carService: CarService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.carService.getCars().subscribe(cars => {
      this.cars = cars;
    });
    this.travelRequests = this.carService.getTravelRequests();

    if (isPlatformBrowser(this.platformId)) {
      if (!localStorage.getItem('isLoggedIn') || localStorage.getItem('userRole') !== 'admin') {
        this.router.navigate(['/login']);
      } else {
        this.username = localStorage.getItem('username') || 'unknown';
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newCarImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addCar() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.newCarImage) {
        alert('Please select an image.');
        return;
      }
      const maxId = this.cars.length > 0 ? Math.max(...this.cars.map(car => car.id)) : 0;
      const car: Car = {
        ...this.newCar,
        id: maxId + 1,
        image: this.newCarImage,
        available: true,
        rented: false
      };
      this.cars.push(car);
      this.newCar = { id: 0, name: '', type: '', pricePerDay: 0, image: '', available: true, rented: false };
      this.newCarImage = null;
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }

  selectCar(carId: number) {
    if (isPlatformBrowser(this.platformId)) {
      const car = this.cars.find(c => c.id === carId);
      if (car) {
        this.selectedCarId = carId;
        this.selectedCarName = car.name;
        this.filteredTravelRequests = this.travelRequests.filter(r => r.carId === carId);
      }
    }
  }

  approveRequest(requestIndex: number) {
    if (isPlatformBrowser(this.platformId)) {
      const globalIndex = this.travelRequests.findIndex((r, i) => r.carId === this.selectedCarId && this.filteredTravelRequests.indexOf(r) === requestIndex);
      if (globalIndex !== -1) {
        this.carService.approveRequest(globalIndex);
        this.travelRequests = this.carService.getTravelRequests();
        this.filteredTravelRequests = this.travelRequests.filter(r => r.carId === this.selectedCarId);
        this.carService.getCars().subscribe(cars => {
          this.cars = cars;
        });
      }
    }
  }

  endRide(carId: number) {
    if (isPlatformBrowser(this.platformId)) {
      this.carService.endRide(carId);
      this.carService.getCars().subscribe(cars => {
        this.cars = cars;
      });
      this.travelRequests = this.carService.getTravelRequests();
      if (this.selectedCarId === carId) {
        this.filteredTravelRequests = this.travelRequests.filter(r => r.carId === this.selectedCarId);
      }
    }
  }

  removeCar(carId: number, carName: string) {
    if (isPlatformBrowser(this.platformId)) {
      const confirmDelete = confirm(`Are you sure you want to remove "${carName}"? This action cannot be undone.`);
      if (confirmDelete) {
        this.carService.removeCar(carId);
        this.carService.getCars().subscribe(cars => {
          this.cars = cars;
        });
        this.travelRequests = this.carService.getTravelRequests();
        if (this.selectedCarId === carId) {
          this.selectedCarId = null;
          this.selectedCarName = '';
          this.filteredTravelRequests = [];
        }
      }
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
    }
    this.router.navigate(['/login']);
  }
}