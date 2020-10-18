
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { DialogService } from '../_services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../_services/auth.service';
import { DriverService } from '../_services/driver.service';
import { Pagination } from '../_models/Pagination';

@Component({
  selector: 'app-Reports',
  templateUrl: './Reports.component.html',
  styleUrls: ['../app.component.css']
})
export class ReportsComponent implements OnInit  , AfterViewInit {

  EmptyData = false;
  DisplayedColumns : string[]= ['id','name','address','photo','status','branchVisited'];
  showLoading = true;
  Driver: MatTableDataSource<any>
  imageSrc;
  searchKey;
  MatAny:any;

  length = 0;
  pageIndex=0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 20];

  cityList : string[];

  driverParams : any ={};
  currentUser
  fff:any

  
  

  paginateData : Pagination ={} as Pagination;

  constructor(public authService : AuthService,
              private driverService : DriverService
              ) { }
  
 
  ngOnInit() {
    this.driverService.GetDriverCityList()
    .subscribe(
      data=>
      { 
        this.fff = data
        this.cityList = this.fff
        
      },
      error=>
      {
        console.log(error)
      }
    )

    this.EmptyData=false;

    if(this.authService.decodedToken?.role.length<4 || this.authService.decodedToken?.role=='DriverAdmin')
    {
        this.currentUser = JSON.parse(localStorage.getItem('user'))
        console.log(this.currentUser)
        this.driverParams.branch= this.currentUser.city
        this.driverParams.status= "BOTH";
    }
    else
    {
        this.driverParams.status="BOTH";
        this.driverParams.branch="ALL";
    }
   
  }

  ngAfterViewInit(): void {
    this.EmptyData=false;
    this.loadUsers();
  }

  loadUsers()
  {
    this.driverService.getDrivers(this.paginateData.currentPage,this.paginateData.itemsPerPage, this.driverParams)
    .subscribe
    (
      data=>{
        this.length = data.pagination.totalItems;
        if(this.length==0){
          this.EmptyData=true;
        }
        else
        {
          this.EmptyData=false;
        }
        this.pageIndex = data.pagination.currentPage -1;
        this.MatAny =  data.result;
        this.Driver = new MatTableDataSource<any>(this.MatAny);
        this.showLoading = false;
      },
      ()=>
      {
        this.EmptyData=true;
      }
    )

  }


  pageChanged(event: number):void
  {
    this.paginateData.currentPage = event['pageIndex']+1;
    this.paginateData.itemsPerPage = event['pageSize'];
    this.loadUsers();
  }

  ClearIt()
  {
    this.searchKey = "";
  }
  
  applyFilter()
  {
    this.Driver.filter = this.searchKey.trim().toLowerCase();
  }


}
