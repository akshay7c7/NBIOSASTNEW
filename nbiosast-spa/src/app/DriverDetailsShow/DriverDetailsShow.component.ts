import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { Driver } from '../_models/Driver';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DialogService } from '../_services/dialog.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LicenseComponentComponent } from '../LicenseComponent/LicenseComponent.component';
import { AuthService } from '../_services/auth.service';
import { DriverService } from '../_services/driver.service';
import { Pagination } from '../_models/Pagination';
import { User } from '../_models/user';

@Component({
  selector: 'app-DriverDetailsShow',
  templateUrl: './DriverDetailsShow.component.html',
  styleUrls: ['../app.component.css']
})
export class DriverDetailsShowComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator : MatPaginator;
  
  EmptyData = false;
  DisplayedColumns : string[]= ['id','name','address','photo','status','actions'];
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
  

  currentUser : User = {} as User
  fff
  cityList: string[] = []
  driverParams:any = {}

  
  ngOnInit() {
   
    if(this.authService.decodedToken?.role.length<4 || this.authService.decodedToken?.role=='DriverAdmin')
    {
        console.log("BranchAdmin")
        this.currentUser = JSON.parse(localStorage.getItem('user'))
        this.driverParams.branch= this.currentUser.city
        console.log(this.driverParams.branch)
    }
    else
    {
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
      console.log("SuperAdmin")
        //this.driverParams.status="BOTH";
        this.driverParams.branch="ALL";
    }

    this.loadUsers();
  }

  ngAfterViewInit(): void {
    
  }

  
  loadUsers()
  {
    this.driverParams.status="BOTH";
    console.log(this.driverParams)
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
      }
    )

  }


  pageChanged(event: number):void
  {
    this.paginateData.currentPage = event['pageIndex']+1;
    this.paginateData.itemsPerPage = event['pageSize'];
    this.loadUsers();
  }





  AddDriver()
  {
    this.router.navigate(['/adddriverdetails']);
  }
  cancelDriverCreation(creation : boolean)
  {
    
    this.addDriverMode = creation;
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


  ChangeStatus(element)
  {
    this.showLoading = true;
    if(element.status=="Pending")
    {
      this.dialogService.openConfirmDialog("Do you want to APPROVE license for "+element.name).afterClosed().subscribe(
        res=>{
          if(res)
          {
            this.ApproveDriver(element.id);
          }
        }
      )
    }
    else
    {
      this.dialogService.openConfirmDialog("Do you want change status to PENDING for "+element.name).afterClosed().subscribe(
        res=>{
          if(res)
          {
            this.PutOnPending(element.id);
          }
        }
      )

    }
    this.showLoading = false;
    
  }


  ApproveDriver(id: any)
  {
      this.driverService.ApproveDriver(id)
      .subscribe(
        next=>{
          this.snacker.open('Approved successfully','',{duration: 1000});
          this.loadUsers();
          
        },
        error=>{
          this.snacker.open(error.error,'',{duration: 1000});
        }
      )
  }



  PutOnPending(id: any)
  {
      this.driverService.PutOnPending(id)
      .subscribe(
        next=>{
          this.snacker.open('Changed to Pending successfully','',{duration: 1000});
          this.loadUsers();
          
        },
        error=>
        {
          this.snacker.open(error.error.title,'',{duration: 1000});
          
        }
        
      )
  }



  AddPrintDriverCount(id: any)
  {
      this.driverService.AddPrintDriverCount(id)
      .subscribe(
        next=>{
          this.snacker.open('Print opened Successfully','',{duration: 1000});
          this.loadUsers();
         
        },
        error=>
        {
          this.snacker.open(error.error.title,'',{duration: 1000});
          
        }
        
      )
  }


  DeleteDriver(element)
  {
    this.dialogService.openConfirmDialog("Do you want to delete this Driver details?").afterClosed().subscribe(
      res=>{
        if(res)
        { 
          this.showLoading = true;
          this.driverService.DeleteDriver(element.id)
          .subscribe(
            next=>{

              this.Driver.data = this.Driver.data
          .filter((value,key)=>{
            return value.id != element.id;
          });
          this.loadUsers();
          this.snacker.open('Driver Deleted successfully','',{duration: 1000})

            },
            error=>{
              this.snacker.open(error.error.title,'',{duration: 1000})
              this.showLoading = false;
              
            }
          )
        }
      }
    )
  }

  EditDriver(element)
  {this.dialogService.openConfirmDialog("Do you want to edit this Driver details?").afterClosed().subscribe(
    res=>{
      if(res)
      { 
        this.router.navigate(['/editdriver',element.id])
      }
  })
}

  PrintDriver(element)
  {
    const dialogCongif = new MatDialogConfig();
    dialogCongif.autoFocus = true;
    dialogCongif.width = "1200px";
    dialogCongif.height = "700px";
    dialogCongif.data = element.id;
    this.dialog.open(LicenseComponentComponent, dialogCongif);
    this.AddPrintDriverCount(element.id);
  }

 
}
