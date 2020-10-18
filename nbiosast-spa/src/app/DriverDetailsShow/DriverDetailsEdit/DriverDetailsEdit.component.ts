import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Driver } from 'src/app/_models/Driver';
import { User } from 'src/app/_models/user';
import { AuthService } from 'src/app/_services/auth.service';
import { DriverService } from 'src/app/_services/driver.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-DriverDetailsEdit',
  templateUrl: './DriverDetailsEdit.component.html',
  styleUrls: ['../../app.component.css']
})
export class DriverDetailsEditComponent implements OnInit {

  @ViewChild('editForm') editForm : FormGroup
 
  one:any =""
  three:any=""
  threeCame = false;

  constructor(
    private fb : FormBuilder, 
    private authService : AuthService,
    private router : Router,
    private snackbar : MatSnackBar,
    private driverService : DriverService,
    private route : ActivatedRoute,
    private userService : UserService,
    private datepipe : DatePipe) { }

    public driver: Driver = {} as Driver;

  ngOnInit() {

    this.route.data
    .subscribe(
      data=>
      {
        this.driver = data['driverEditResolve']
        if(this.driver.trainingPeriod==3)
        {
          this.three=true
          this.doc = false
          this.invalid = false
          this.threeCame = true;
        }
        else{
          this.one=true
          this.doc = true
        }
        this.GetValidity()
        this.diffDays = this.driver.validity
      },
      error=>
      {
        console.log(error)
      }
    )
   
  }

  selectedDocument:File;
  selectedOneDayDoc: File;
  selectedPhoto: File;



  Docname = "Document"
  onFileChangeDocument(event) {
  
    this.Docname = this.getFileDetails(event)
    this.selectedDocument = <File>event.target.files[0];
  }

  onedaydocname = "Certificate"
  onFileChangeOneDayDoc(event) {

    this.onedaydocname= this.getFileDetails(event)
    this.selectedOneDayDoc = <File>event.target.files[0];
    this.invalid = false
  }

  photoname = "Photo"
  onFileChangePhoto(event) {

    this.photoname = this.getFileDetails(event)
    this.selectedPhoto = <File>event.target.files[0];
  }


  getTraining(event)
  {
    console.log(event.target.value)
  }

  
  getFileDetails(event)
  {
    var filename = event.target.files[0].name
    return filename;
  }

 

  SaveDriver()
  {
    this.AddYears();
    this.driver.validity = this.diffDays
    
    var formData = new FormData();
    formData.append('Document', this.selectedDocument);
    formData.append('OnedayDoc', this.selectedOneDayDoc);
    formData.append('Photo', this.selectedPhoto);
    formData.append('Name', this.driver.name);
    formData.append('Address', this.driver.address);
    formData.append('CertificateNo', this.driver.certificateNo);
    formData.append('LicenseNo', this.driver.licenseNo);
    formData.append('TransPortName', this.driver.transPortName);
    formData.append('TransPortAddress', this.driver.transPortAddress);
    formData.append('TransPortPhoneNo', this.driver.transPortPhoneNo);
    formData.append('Amount', this.driver.amount);
    formData.append('PaymentType', this.driver.paymentType);
    formData.append('DOB', this.datepipe.transform(this.driver.dob, 'dd/MM/yyyy'));
    formData.append('TrainingStartDate', this.datepipe.transform(this.driver.trainingStartDate, 'dd/MM/yyyy'));
    formData.append('TrainingEndDate', this.datepipe.transform(this.driver.trainingEndDate, 'dd/MM/yyyy'));
    formData.append('TrainingPeriod', this.driver.trainingPeriod.toString());
    formData.append('BranchVisited', this.driver.branchVisited);
    formData.append('Validity', this.driver.validity.toString());
      this.driverService.UpdateDriver(formData, this.driver.id)
      .subscribe(
        ()=>{
          this.snackbar.open('Driver details updated Successfully','',{duration : 1000});
          this.ngOnInit();
            },
            
        error =>{
          console.log(error);
          this.snackbar.open(error.error,'',{duration : 1000});}
                )

  }

  Cancel()
  {
    this.router.navigate(['/driverdetails']);
  }

  invalid = true
  doc=true;
  hideDoc(event)
  {
    console.log(event.target.value)
    this.driver.trainingPeriod = event.target.value
    if(event.target.value==3)
    {
      this.doc=false;
      this.invalid = false
    }
    else{

      this.selectedOneDayDoc = null
      this.onedaydocname = "Certificate"
      this.doc=true;
      this.invalid = true
      
    }
  }

  trainingEnd
  AddYears()
  {
    var d = new Date(this.driver.trainingStartDate);
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    this.trainingEnd = new Date(year + parseInt(this.diffDays), month, day);
    this.driver.trainingEndDate = this.trainingEnd
  }

  diffDays
  GetValidity()
  {
    var time = new Date(this.driver.trainingEndDate).getTime() - new Date(this.driver.trainingStartDate).getTime();
    this.diffDays = Math.ceil(time / (365 * 1000 * 3600 * 24)); 
    console.log(this.diffDays)
  }

}
