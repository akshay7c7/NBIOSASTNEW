import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Dashboard } from '../_models/Dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

constructor(private http: HttpClient) { }
baseUrl = environment.apiUrl + 'driver/'; 
  GetTodaysDetails(branch:string)
  {
    console.log(branch)
    return this.http.get<Dashboard>(this.baseUrl+'GetDashData/'+branch)
  }

}
