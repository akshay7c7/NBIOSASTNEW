import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { Driver } from '../_models/Driver';
import { MatPaginator } from '@angular/material/paginator';
import { DialogService } from '../_services/dialog.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LicenseComponentComponent } from '../LicenseComponent/LicenseComponent.component';
import { AuthService } from '../_services/auth.service';
import { DriverService } from '../_services/driver.service';
import { Pagination } from '../_models/Pagination';
import { User } from '../_models/user';

@Component({
  selector: 'app-ExpireCardDetails',
  templateUrl: './ExpireCardDetails.component.html',
  styleUrls: ['../app.component.css']
})
export class ExpireCardDetailsComponent implements OnInit  , AfterViewInit {

  EmptyData = false;
  DisplayedColumns : string[]= ['id','name','address','photo','branchVisited'];
  showLoading = true;
  Driver: MatTableDataSource<any>
  imageSrc;
  searchKey;
  MatAny:any;

  length = 0;
  pageIndex=0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 20];

  addDriverMode = false;

  user : User[];

  driverParams : any ={};

  
  

  paginateData : Pagination ={} as Pagination;

  constructor(private userService : UserService,
              private snacker : MatSnackBar, 
              public authService : AuthService,
              private route : ActivatedRoute, 
              private router : Router,
              private http: HttpClient,
              private dialogService : DialogService,
              private dialog : MatDialog,
              private driverService : DriverService
              ) { }
  
  fff:any
  ngOnInit() {
    this.userService.GetBranchAdminsDetails()
    .subscribe(
      data=>
      { this.fff = data
        this.user = this.fff;
      }
    )
    this.EmptyData=false;
    

  }

  ngAfterViewInit(): void {
    this.EmptyData=false;
    this.loadUsers();
  }

  loadUsers()
  {
    this.driverService.getDrivers(this.paginateData.currentPage,this.paginateData.itemsPerPage, null, "YES")
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
      error=>
      {
        this.EmptyData=true;
      }
    )

  }


  pageChanged(event: number):void
  {
    //console.log(event);
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

