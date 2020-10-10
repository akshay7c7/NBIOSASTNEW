import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Dashboard } from '../_models/Dashboard';
import { AuthService } from '../_services/auth.service';
import { DashboardService } from '../_services/dashboard.service';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['../app.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private dashService : DashboardService, 
    public authService : AuthService,
     private userService : UserService,
    private snackbar : MatSnackBar) { }


  Branch
  BranchCity
  currentUser
  ngOnInit() {
    
    this.userService.GetCityList().
      subscribe(
        data=> {this.BranchCity = data},
        error=>{
          console.log(error);
        }
      )
    
    if(this.authService.decodedToken?.role.length<4 || this.authService.decodedToken?.role=='DriverAdmin')
    {
      this.currentUser =JSON.parse(localStorage.getItem('user'))
      this.Branch = this.currentUser.city
    }
    else
    {
      this.Branch = "ALL"
    }

    this.GetTodaysData()
   
  }

  DashData :Dashboard={} as Dashboard;
  GetTodaysData()
  {
    this.dashService.GetTodaysDetails(this.Branch)
    .subscribe(
      data=>
      {
        console.log(data)
        this.DashData = data
        this.snackbar.open("Dashboard Updated",'',{duration:1000})
      },
      error=>
      {
        this.snackbar.open("Error updating Dashboard",'',{duration:1000})
      }
    )
  }
}
