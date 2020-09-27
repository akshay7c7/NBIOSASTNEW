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
  

  paginateData : Pagination

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
  
  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.loadUsers();
  }


  MatAny:any;
  loadUsers()
  {
    this.driverService.getDrivers(2,6)
    .subscribe
    (
      data=>{
        console.log(data.result);
        this.MatAny =  data.result;
        this.Driver = new MatTableDataSource<any>(this.MatAny);
        this.showLoading = false;
        this.Driver.paginator = this.paginator;
        if(data.result==[]){
          this.EmptyData=true;
        }
      }
    )

  }

  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20];

  // MatPaginator Output
  pageEvent: PageEvent;

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  pageChanged(event: number):void
  {
    console.log(event);
  }



  addDriverMode = false;

  AddDriver()
  {
    this.addDriverMode=true;
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
    
    
  }
  ApproveDriver(id: any)
  {
      this.driverService.ApproveDriver(id)
      .subscribe(
        next=>{
          this.snacker.open('Approved successfully','',{duration: 1000});
          this.loadUsers();
          //this.ngOnInit();
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
        { this.driverService.DeleteDriver(element.id)
          .subscribe(
            next=>{

              this.Driver.data = this.Driver.data
          .filter((value,key)=>{
            return value.id != element.id;
          });
          this.snacker.open('Driver Deleted successfully','',{duration: 1000})

            },
            error=>{
              this.snacker.open(error.error.title,'',{duration: 1000})
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
        this.router.navigate(['/editdriver'])
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
