import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Car {
  id: number;
  name: string;
  type: string;
  pricePerDay: number;
  image?: string;
  available: boolean;
  rented: boolean;
}

export interface TravelRequest {
  name: string;
  address: string;
  age: number;
  origin: string;
  destination: string;
  date: string;
  carId: number;
  approved: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private cars: Car[] = [
    {
      id: 1,
      name: 'Car 1',
      type: 'Sedan',
      pricePerDay: 50,
      image:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
      available: true,
      rented: false,
    },
    {
      id: 2,
      name: 'Car 2',
      type: 'SUV',
      pricePerDay: 70,
      image:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
      available: true,
      rented: false,
    },
    {
      id: 3,
      name: 'Car 3',
      type: 'Truck',
      pricePerDay: 90,
      image:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
      available: true,
      rented: false,
    },
  ];
  private travelRequests: TravelRequest[] = [];

  constructor(private http: HttpClient) {}

  getCars(): Observable<Car[]> {
    return of(this.cars);
  }

  requestRental(carId: number, username: string) {
    const car = this.cars.find((c) => c.id === carId);
    if (car && car.available && !car.rented) {
      car.available = false;
    }
  }

  hasPendingRequest(carId: number): boolean {
    return this.travelRequests.some((r) => r.carId === carId && !r.approved);
  }

  addTravelRequest(carId: number, travelRequest: TravelRequest) {
    const request = { ...travelRequest, carId, approved: false };
    this.travelRequests.push(request);
    return request;
  }

  getTravelRequests(): TravelRequest[] {
    return this.travelRequests;
  }

  approveRequest(requestId: number) {
    const request = this.travelRequests.find((r, i) => i === requestId);
    if (request && !request.approved) {
      request.approved = true;
      const car = this.cars.find((c) => c.id === request.carId);
      if (car) {
        car.available = false;
        car.rented = true;
      }
    }
  }

  endRide(carId: number) {
    const car = this.cars.find((c) => c.id === carId);
    if (car && car.rented) {
      car.available = true;
      car.rented = false;
      this.travelRequests = this.travelRequests.filter(
        (r) => r.carId !== carId || !r.approved
      );
    }
  }

  removeCar(carId: number) {
    // Remove the car from the list
    this.cars = this.cars.filter((c) => c.id !== carId);
    // Remove any associated travel requests
    this.travelRequests = this.travelRequests.filter((r) => r.carId !== carId);
  }

  getRentalStatus(
    carId: number,
    username: string
  ): 'pending' | 'approved' | 'rented' | 'rejected' | null {
    const request = this.travelRequests.find(
      (r) => r.carId === carId && !r.approved
    );
    if (request) return 'pending';
    const approvedRequest = this.travelRequests.find(
      (r) => r.carId === carId && r.approved
    );
    if (approvedRequest) return 'approved';
    const car = this.cars.find((c) => c.id === carId);
    if (car && car.rented) return 'rented';
    return null;
  }
}
