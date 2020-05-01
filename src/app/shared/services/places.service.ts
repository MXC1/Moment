import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/auth/auth.service';
import { take, map, switchMap, tap } from 'rxjs/operators';
import { Place } from '../models/place';

interface PlaceData {
  name: string;
  googleId: string;
  image: string;
  rating: number;
  type: string;
  vicinity: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  constructor(private authService: AuthService, private http: HttpClient) { }

  fetchPlaces() {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<{ [key: string]: PlaceData }>(`https://mmnt-io.firebaseio.com/places.json?auth=${token}`).pipe(take(1), map(resData => {

        const returnPlaces = [];

        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            returnPlaces.push(new Place(key, resData[key].name, resData[key].googleId, resData[key].image, resData[key].rating, resData[key].type, resData[key].vicinity))
          }
        }

        console.log(returnPlaces);


        return returnPlaces;
      }))
    }))
  }

  getPlace(id: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<PlaceData>(`https://mmnt-io.firebaseio.com/places/${id}.json?auth=${token}`).pipe(take(1), map(resData => {
        if (resData !== null) {
          return new Place(id, resData.name, resData.googleId, resData.image, resData.rating, resData.type, resData.vicinity);
        }
      }))
    }))
  }

  getPlaceByGoogleId(id: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<{ [key: string]: PlaceData }>(`https://mmnt-io.firebaseio.com/places.json?auth=${token}`).pipe(take(1), map(resData => {
        for (const key in resData) {
          if (resData[key].googleId === id) {
            return new Place(key, resData[key].name, resData[key].googleId, resData[key].image, resData[key].rating, resData[key].type, resData[key].vicinity);
          }
        }
      }))
    }))
  }

  addPlace(name: string, googleId: string, image: string, rating: number, type: string, vicinity: string) {
    const newPlace = new Place('', name, googleId, image, rating, type, vicinity);

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.post(`https://mmnt-io.firebaseio.com/places.json/?auth=${token}`, { ...newPlace, id: null });
    }));
  }
}
