import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt' ;
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.apiUrl + 'auth/'; 
  jwtHelper = new JwtHelperService();
  decodedToken : any;
  currentUser : User;


  constructor(private http : HttpClient) { }

  login(model : any)
  {
    console.log(this.baseUrl)
      return(this.http.post(this.baseUrl +'login',model) 
      .pipe(
        map((response : any)=>{
          const user = response;
          if(user)
          {
            localStorage.setItem('token', user.token);
            localStorage.setItem('user',JSON.stringify(user.user));
            this.decodedToken= this.jwtHelper.decodeToken(user.token);
            this.currentUser= user.user;
            const userRoles = this.decodedToken.role as Array<string>;
            console.log(userRoles);
          }
        }
      )
      )
      )
  }

  registerAdmin(role_id, user : User)
  {
    return (this.http.post(this.baseUrl + 'createAdmin/'+role_id,user));
  }

  loggedIn()
  {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  EditPassword(id:number, password: User)
  {
    return this.http.put(this.baseUrl+"editPassword/"+id,password);
  }

  private _loggingInSource = new Subject<boolean>();
  loggingIn$ = this._loggingInSource.asObservable(); 
  HideSidebarTopBar(data : boolean)
  {
    this._loggingInSource.next(data);
  }

  logout()
  {
    this.http.post(this.baseUrl+'logout/'+ this.decodedToken.nameid,{}).subscribe(
      );
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const token =  localStorage.getItem('token');
    if(token===null)
    {
      return true;
    }
    return false;
  }

  roleMatch(allowedRoles): boolean {
    let isMatch = false;
    const userRoles = this.decodedToken.role as Array<string>;
    allowedRoles.forEach(element => {
      if (userRoles.includes(element)) {
        isMatch = true;
        return;
      }
    });
    return isMatch;
  }



}
