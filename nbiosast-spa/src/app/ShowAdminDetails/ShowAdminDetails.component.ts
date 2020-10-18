import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { City } from 'src/app/_services/cities';
import { User } from '../_models/user';
import { AuthService } from '../_services/auth.service';
import { DialogService } from '../_services/dialog.service';
import { UserService } from '../_services/user.service';


@Component({
  selector: 'app-ShowAdminDetails',
  templateUrl: './ShowAdminDetails.component.html',
  styleUrls: ['../app.component.css']
})
export class ShowAdminDetailsComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator : MatPaginator;
  DisplayedColumns =["id","nameAdmin", "userName", "email", "action"];
  showLoading = true;
  UserAdmin : MatTableDataSource<any>
  searchKey;
  EmptyData=false;
  fff:any
  BranchCity : string[];
  currentUser : User = {} as User

  AdminDetails:any={};
  
    constructor(private userService : UserService,
                public authService : AuthService,
                private snacker : MatSnackBar, 
                private route : ActivatedRoute, 
                private router : Router,
                private ngZone : NgZone,
                private cityService : City,
                private dialog : DialogService
                ) { }
  
    ngOnInit() {
      this.userService.GetCityList()
    .subscribe(
      data=>
      { this.fff = data
        this.BranchCity = this.fff;
        console.log(this.BranchCity)
      }
    )
    this.EmptyData=false;
    if(this.authService.decodedToken?.role.length<4 || this.authService.decodedToken?.role=='DriverAdmin')
    {
      this.currentUser =JSON.parse(localStorage.getItem('user'))
      this.AdminDetails.Branch = this.currentUser.city
      this.AdminDetails.type = 2
    }
    else{
      this.AdminDetails.type = "ALL"
      this.AdminDetails.Branch = "ALL"
      
    }
    this.loadUsers();
    }
  
    
  
    ngAfterViewInit(): void {
      
      
    }
 
    loadUsers()
    {
      this.userService.GetAllUsers(this.AdminDetails)
      .subscribe(
        data =>{
              if(data.body.length == 0)
              {
                this.EmptyData=true;
              }
              else
              {
                this.EmptyData=false;
              }
                console.log(data.body);
                this.UserAdmin = new MatTableDataSource<any>(data.body);
                this.UserAdmin.paginator = this.paginator;
                this.showLoading = false;
        },

        error=>
        {
          console.log(error.error.title);
          this.EmptyData=true;
          this.showLoading = false;
        }
      )
    }
    

  
    AddAdmin()
    {
      this.router.navigate(['/addadmin'])
    }

  
    ClearIt()
    {
      this.searchKey = "";
    }
    applyFilter()
    {
      this.UserAdmin.filter = this.searchKey.trim().toLowerCase();
    }
  
    DeleteUser(element)
    {
      this.dialog.openConfirmDialog("Do you want to delete this Admin?").afterClosed().subscribe(
        res=>{
          if(res)
          { this.userService.DeleteUser(element.id)
            .subscribe(
              next=>{
  
                this.UserAdmin.data = this.UserAdmin.data
            .filter((value,key)=>{
              return value.id != element.id;
            });
            this.snacker.open('Branch Deleted successfully','',{duration: 1000})
  
              },
              error=>{
                console.log(error);
                this.snacker.open(error.error,'',{duration: 1000})
              }
            )
          }
        }
      )
    
    }
  }
  

