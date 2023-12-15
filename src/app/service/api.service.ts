import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  url = environment.url;
  isApp = environment.isApp;
    // url = 'http://localhost:8001/';

  constructor(private http: HttpClient) {
      console.log('api url===', this.url);
  }

  html(endpoint: string) {
      return this.http.get(this.url + endpoint, {responseType: "text"});
  }

  get(endpoint: string, params?: object, reqOpts?: any): Observable<any> {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }
    if (this.isApp) {
        reqOpts.params = reqOpts.params.set('_via', 'app');
    }
    return this.http.get(this.url + endpoint, reqOpts);
  }

  post(endpoint: string, params: object, options?: object): Observable<any> {
    if (this.isApp) {
        if (!params) {
            params = {};
        }
        params = {...params, ...{
            '_via': 'app'
        }};
    }
    return this.http.post(this.url + endpoint, params, options);
  }

  update(endpoint: string, params: object): Observable<any> {
    return this.http.put(this.url + endpoint, params);
  }

  delete(endpoint: string, params?: object): Observable<any> {
    return this.http.delete(this.url + endpoint, params);
  }
}
