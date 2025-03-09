import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CarService, Car, TravelRequest } from '../car.service';

interface State {
  id: string;
  name: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  cars: Car[] = [];
  selectedCarId: number | null = null;
  selectedCarName: string = '';
  selectedCar: Car | null = null;
  travelRequest: TravelRequest = {
    name: '',
    address: '',
    age: 0,
    origin: '',
    destination: '',
    date: '',
    carId: 0,
    approved: false // Added approved property
  };
  route: string = '';
  errorMessage: string = '';
  states: State[] = [];
  username: string = '';

  constructor(
    private router: Router,
    public carService: CarService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.carService.getCars().subscribe(cars => {
      this.cars = cars;
    });

    if (isPlatformBrowser(this.platformId)) {
      if (!localStorage.getItem('isLoggedIn') || localStorage.getItem('userRole') !== 'user') {
        this.router.navigate(['/login']);
      } else {
        this.username = localStorage.getItem('username') || 'unknown';
      }
    }
  }

  requestRental(carId: number) {
    if (isPlatformBrowser(this.platformId)) {
      const car = this.cars.find(c => c.id === carId);
      if (car && car.available && !this.carService.hasPendingRequest(carId)) {
        this.selectedCarId = carId;
        this.selectedCarName = car.name;
        this.selectedCar = car;
        this.travelRequest = {
          name: '',
          address: '',
          age: 0,
          origin: '',
          destination: '',
          date: '',
          carId: carId,
          approved: false // Added approved property
        };
        this.route = '';
        this.errorMessage = '';
        this.states = [];
      }
    }
  }

  onSubmit() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.travelRequest.name || !this.travelRequest.address || !this.travelRequest.age ||
          !this.travelRequest.origin || !this.travelRequest.destination || !this.travelRequest.date) {
        this.errorMessage = 'All fields are required.';
        return;
      }

      if (this.travelRequest.age < 18) {
        this.errorMessage = 'You must be at least 18 years old to make a travel request.';
        return;
      }

      this.carService.addTravelRequest(this.travelRequest.carId, this.travelRequest);
      this.carService.requestRental(this.travelRequest.carId, this.username);
      alert(`Rental and travel request for ${this.selectedCarName} has been submitted. Waiting for admin approval.`);
      this.cancelRequest();
    }
  }

  onOriginClick() {
    if (this.states.length === 0 && isPlatformBrowser(this.platformId)) {
      this.fetchStates();
    }
  }

  onDestinationClick() {
    if (this.states.length === 0 && isPlatformBrowser(this.platformId)) {
      this.fetchStates();
    }
  }

  private fetchStates() {
    const url = '/api/GetAllState';
    console.log(`Attempting to fetch states from ${url} at ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`);

    this.http.get<any>(url, { withCredentials: false }).subscribe({
      next: (response) => {
        console.log('Raw API Response:', response);
        let statesData: any[] = [];

        if (Array.isArray(response)) {
          statesData = response;
        } else if (response && typeof response === 'object') {
          if (Array.isArray(response.states)) statesData = response.states;
          else if (Array.isArray(response.data)) statesData = response.data;
          else if (Array.isArray(response.results)) statesData = response.results;
          else statesData = Object.values(response).find(Array.isArray) || [];
        } else if (typeof response === 'string') {
          try {
            const parsed = JSON.parse(response);
            statesData = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            statesData = [];
          }
        }

        if (statesData.length > 0) {
          this.states = statesData.map(item => {
            const id = item.id || item.stateId || item.code || item.toString();
            const name = item.name || item.stateName || item.title || item.toString();
            return { id, name };
          });
          this.errorMessage = '';
          console.log('Mapped States:', this.states);
        } else {
          this.errorMessage = 'Failed to load states: No valid state data found in response.';
          this.states = [];
        }
      },
      error: (err) => {
        console.error('API Error Details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          url: err.url,
          response: err.error ? (err.error.message || err.error) : 'No response body'
        });
        this.errorMessage = 'Error loading states: Failed to connect to the API. Please try again later.';
        this.states = [];
      }
    });
  }

  cancelRequest() {
    this.selectedCarId = null;
    this.selectedCarName = '';
    this.selectedCar = null;
    this.travelRequest = {
      name: '',
      address: '',
      age: 0,
      origin: '',
      destination: '',
      date: '',
      carId: 0,
      approved: false // Added approved property
    };
    this.route = '';
    this.errorMessage = '';
    this.states = [];
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