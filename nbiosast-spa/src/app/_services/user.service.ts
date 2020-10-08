import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
constructor(private http : HttpClient) { }
baseUrl = environment.apiUrl + 'users/';

    GetBranchAdminsDetails()
    {
    return this.http.get(this.baseUrl +'branchDetails');
    }

    GetUserDetail(id):Observable<User>
    {
      return this.http.get<User>(this.baseUrl+id);
    }

    GetCityList()
    {
      return this.http.get(this.baseUrl+"getcitylist")
    }

    GetAllUsers(AdminDetails)
    {
      let params= new HttpParams();
      params = params.append('userType',AdminDetails.type)
      params = params.append('branch',AdminDetails.Branch)
      console.log(params)
      return this.http.get<User[]>(this.baseUrl+"getAllUsers", {observe:'response',params})
      .pipe(
        map( response =>{
            
            return response;
          })  
      );
    }

    EditUserDetails(id:number, user: User)
    {
      return this.http.put(this.baseUrl+id,user);
    }

    DeleteUser(id:number)
    {
      return this.http.delete(this.baseUrl+"DeleteUser/"+id);
    }

    


}