import { HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Driver } from '../_models/Driver';
import { User } from '../_models/user';
import { AuthService } from '../_services/auth.service';
import { DriverService } from '../_services/driver.service';
import { UserService } from '../_services/user.service';
import {map} from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-AddDriverDetails',
  templateUrl: './AddDriverDetails.component.html',
  styleUrls: ['../app.component.css']
})
export class AddDriverDetailsComponent implements OnInit {


  createDriverForm : FormGroup;
  public user: User = {} as User;

  constructor(
    private fb : FormBuilder, 
    private authService : AuthService,
    private router : Router,
    private snackbar : MatSnackBar,
    private driverService : DriverService,
    private route : ActivatedRoute,
    private userService : UserService,
    public datepipe: DatePipe) { }

  ngOnInit() {
    this.CreateDriver();
    this.userService.GetUserDetail(this.authService.decodedToken.nameid)
    .subscribe(
      data=>
      {
        console.log(data);
        this.user = data;
      }
    )
  }

  CreateDriver()
  {
    this.createDriverForm = this.fb.group
    (
      {
        
        Name :['',Validators.required],
        CertificateNo : ['',Validators.required],
        LicenseNo :['',Validators.required],
        TransPortName :['',Validators.required],
        TransPortAddress :['',Validators.required],
        Address :['',Validators.required],
        Amount :['',Validators.required],
        PaymentType :['',Validators.required],
        DOB :['',Validators.required],
        TrainingStartDate :['',Validators.required],
        TrainingEndDate :['',Validators.required],
        TrainingPeriod :['',Validators.required],
        Document : ['', Validators.required],    
        Photo :['', Validators.required],             
        OneDayDoc: [''],
        Validity: [''],
        TransPortPhoneNo :[''] 

      }

    )
  }


  selectedDocument:File;
  selectedOneDayDoc: File;
  selectedPhoto: File;

  Docname = "Upload Document"
  onFileChangeDocument(event) {
  
    this.Docname = this.getFileDetails(event)
    this.selectedDocument = <File>event.target.files[0];
  }

  onedaydocname = "Upload 1 day doc"
  onFileChangeOneDayDoc(event) {

    this.onedaydocname= this.getFileDetails(event)
    this.selectedOneDayDoc = <File>event.target.files[0];
  }

  photoname = "Upload Photo"
  onFileChangePhoto(event) {

    this.photoname = this.getFileDetails(event)
    console.log(this.photoname);
    this.selectedPhoto = <File>event.target.files[0];
  }


  diffDays
  GetValidity()
  {
    var time = new Date(this.createDriverForm.get('TrainingEndDate').value).getTime() - new Date(this.createDriverForm.get('TrainingStartDate').value).getTime();
    this.diffDays = Math.ceil(time / (365 * 1000 * 3600 * 24)); 
    console.log(this.diffDays);
  }

  
  getFileDetails(event)
  {
    var filename = event.target.files[0].name
    return filename;
  }

  SaveDriver()
  {   
      if(this.createDriverForm.valid)
      {
        console.log("true");
      var formData = new FormData();
      formData.append('Document', this.selectedDocument);
      formData.append('OnedayDoc', this.selectedOneDayDoc);
      formData.append('Photo', this.selectedPhoto);
      formData.append('Name', this.createDriverForm.get('Name').value);
      formData.append('Address', this.createDriverForm.get('Address').value);
      formData.append('CertificateNo', this.createDriverForm.get('CertificateNo').value);
      formData.append('LicenseNo', this.createDriverForm.get('LicenseNo').value);
      formData.append('TransPortName', this.createDriverForm.get('TransPortName').value);
      formData.append('TransPortAddress', this.createDriverForm.get('TransPortAddress').value);
      formData.append('TransPortPhoneNo', this.createDriverForm.get('TransPortPhoneNo').value);
      formData.append('Amount', this.createDriverForm.get('Amount').value);
      formData.append('PaymentType', this.createDriverForm.get('PaymentType').value);
      formData.append('DOB', this.datepipe.transform(this.createDriverForm.get('DOB').value, 'dd/MM/yyyy'));
      formData.append('TrainingStartDate', this.datepipe.transform(this.createDriverForm.get('TrainingStartDate').value, 'dd/MM/yyyy'));
      formData.append('TrainingEndDate', this.datepipe.transform(this.createDriverForm.get('TrainingEndDate').value, 'dd/MM/yyyy'));
      formData.append('TrainingPeriod', this.createDriverForm.get('TrainingPeriod').value);
      formData.append('BranchVisited', this.user.city);


      this.driverService.SaveDriver(formData)
      .subscribe(
        ()=>{
          this.snackbar.open('Driver details added Successfully','',{duration : 1000});
          //this.createDriverForm.reset();
            },
            
        error =>{
          console.log(error)
          this.snackbar.open(error.error.title,'',{duration : 1000});}
                )
      }

      else
      {
        this.snackbar.open('Please fill the required fields','',{duration : 1000});
      }

      

  }

  Cancel()
  {
    this.createDriverForm.reset();
    this.router.navigate['/driverdetails'];
  }

  doc=true;
  hideDoc(data)
  {
    this.doc = data;
  }
}
