import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Driver } from '../_models/Driver';
import { PaginatedResult } from '../_models/Pagination';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

constructor(private http: HttpClient) { }
baseUrl = environment.apiUrl + 'driver/'; //http://localhost:5000/api/driver/


  SaveDriver(driver : FormData)
  {
      return this.http.post(this.baseUrl +'AddDriver', driver);
  }

  UpdateDriver(driver : FormData)
  {
      return this.http.post(this.baseUrl +'UpdateDriver', driver);
  }

  getDriver(id: number)
  {
    return this.http.get(this.baseUrl + 'getdriver/'+id);
  }

  getDrivers(page? , itemsPerPage?, driverParams?, expire?)
  {
    const paginatedResult : PaginatedResult<Driver[]> = new PaginatedResult<Driver[]>();
    let params= new HttpParams();

    if(page!=null && itemsPerPage!=null)
    {
      params = params.append('pageNumber',page);
      params = params.append('pageSize',itemsPerPage);
    }

    if(driverParams !=null)
    {
      params = params.append('status', driverParams.status);
      params = params.append('branchCity', driverParams.branch);
    }

    if(expire!=null)
    {
      params = params.append('expiredCard', expire);
    }
    
    console.log(params)
    return this.http.get<Driver[]>(this.baseUrl + 'getAlldrivers', {observe:'response',params})
  .pipe(
    map( response =>{
        paginatedResult.result=response.body;
        if(response.headers.get('Pagination')!=null)
        {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'))
        }
        return paginatedResult;
      })  
  );
  }

  ApproveDriver(id : any)
  {
    return this.http.put(this.baseUrl +'Approve/'+id,{})
  }

  PutOnPending(id : any)
  {
    return this.http.put(this.baseUrl +'PutOnPending/'+id,{})
  }

  AddPrintDriverCount(id : any)
  {
    return this.http.put(this.baseUrl +'RecordPrint/'+id,{})
  }

  DeleteDriver(id : any)
  {
    return this.http.delete(this.baseUrl + 'DeleteDriver/'+id);
  }

  
 
}
