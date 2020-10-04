import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../app.component.css']
})
export class LoginComponent implements OnInit {
  loading = false;
  show : any;
  model : any = {};

  constructor(private authService : AuthService ,
               private router : Router,
               private snackbar : MatSnackBar) { }

  ngOnInit() {
      if(this.loggedIn())
      {
        this.router.navigate(['/dashboard']);
      }
  }

  login()
  {
    this.loading = true;
    this.authService.login(this.model)
    .subscribe(
      
      next => {
        this.loading = true
        this.snackbar.open('Logged in successfully','',{duration : 1000}) ;
        this.loading = false
      }, 
      error => {
        this.loading = true
        console.log(error);
        if(error.statusText==="Unknown Error" || error.status == "0")
        {
          this.snackbar.open("Server Failure, Please try again",'',{duration:1000}) ;
        }
        if(error.statusText==="Unauthorized")
        {
          this.snackbar.open("Username or Password is incorrect",'',{duration:1000}) ;
        }
        else{
          this.snackbar.open("Server Failure, Please try again",'',{duration:1000}) ;
        } 
        this.loading = false
      },
        
      ()=> this.router.navigate(['/dashboard']));
     this.loading = false;
  }

  loggedIn()
  {
    this.show = this.authService.loggedIn();
    return this.show;

  }
}
