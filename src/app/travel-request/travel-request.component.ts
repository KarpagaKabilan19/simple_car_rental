import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface TravelRequest {
  name: string;
  address: string;
  age: number;
  origin: string;
  destination: string;
  date: string;
  route?: string; // To store the API response
}

@Component({
  selector: 'app-travel-request',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './travel-request.component.html',
  styleUrls: ['./travel-request.component.css']
})
export class TravelRequestComponent implements OnInit {
  travelRequest: TravelRequest = {
    name: '',
    address: '',
    age: 0,
    origin: '',
    destination: '',
    date: ''
  };
  route: string = '';
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize with any saved data if needed (e.g., from localStorage)
      const savedData = localStorage.getItem('travelRequest');
      if (savedData) {
        this.travelRequest = JSON.parse(savedData);
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

      // Save to localStorage for this session
      localStorage.setItem('travelRequest', JSON.stringify(this.travelRequest));

      // Call Geoapify Directions API
      this.getRoute();
    }
  }

  private getRoute() {
    const apiKey = 'e8295d1b7e0c46128da8721d01a283c8'; // Replace with your Geoapify API key
    const url = `https://api.geoapify.com/v1/routing?waypoints=${encodeURIComponent(this.travelRequest.origin)}|${encodeURIComponent(this.travelRequest.destination)}&mode=drive&apiKey=${apiKey}`;

    this.http.get(url).subscribe({
      next: (response: any) => {
        if (response.features && response.features.length > 0) {
          const route = response.features[0].properties.summary;
          this.route = `Distance: ${route.distance / 1000} km, Duration: ${Math.round(route.duration / 60)} minutes`;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'No route found. Please check the locations.';
        }
      },
      error: (err) => {
        this.errorMessage = 'Error fetching route: ' + err.message;
        this.route = '';
      }
    });
  }
}