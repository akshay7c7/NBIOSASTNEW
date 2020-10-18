import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../_models/user';
import { AuthService } from '../_services/auth.service';
import { DriverService } from '../_services/driver.service';
import { UserService } from '../_services/user.service';
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
    this.doc = false
    this.invalid = false
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
        PaymentType :['Cash',Validators.required],
        DOB :['',Validators.required],
        TrainingStartDate :['',Validators.required],
        TrainingPeriod :['3',Validators.required],
        Document : ['', Validators.required],    
        Photo :['', Validators.required],
        TransPortPhoneNo :['',Validators.required],             
        OneDayDoc: [''],
        Validity: ['3'],
      }

    )
  }


  test1 = true
  invalid = true
  doc:boolean=true;
  hideDoc(event)
  {
    if(event.target.value==3)
    {
      this.doc = false
      this.invalid = false
      
    }
    else
    {
      this.createDriverForm.get('OneDayDoc').reset()
      this.selectedOneDayDoc=null
      this.onedaydocname ="cerificate"
      this.doc = true
      this.invalid = true
      
    }
  }

  trainingEndDate
  AddYears()
  {
    var d = new Date(this.createDriverForm.get('TrainingStartDate').value);
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    this.trainingEndDate = new Date(year + parseInt(this.createDriverForm.get('Validity').value), month, day);
    console.log(this.datepipe.transform(this.trainingEndDate, 'dd/MM/yyyy'))
  }

  selectedDocument:File;
  selectedOneDayDoc: File;
  selectedPhoto: File;

  Docname = "Document"
  onFileChangeDocument(event) {
  
    this.Docname = this.getFileDetails(event)
    this.selectedDocument = <File>event.target.files[0];
  }

  onedaydocname ="cerificate"
  onFileChangeOneDayDoc(event) {

    this.onedaydocname= this.getFileDetails(event)
    this.selectedOneDayDoc = <File>event.target.files[0];
    this.invalid = false
  }

  photoname = "your photo"
  onFileChangePhoto(event) {

    this.photoname = this.getFileDetails(event)
    this.selectedPhoto = <File>event.target.files[0];
  }



  
  getFileDetails(event)
  {
    var filename = event.target.files[0].name
    return filename;
  }

  

  SaveDriver()
  {   
    this.AddYears()

      if(this.createDriverForm.valid)
      {
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
      formData.append('TrainingEndDate',this.datepipe.transform(this.trainingEndDate, 'dd/MM/yyyy'));
      formData.append('TrainingPeriod', this.createDriverForm.get('TrainingPeriod').value);
      formData.append('BranchVisited', this.user.city);
      formData.append('Validity', this.createDriverForm.get('Validity').value);

      console.log(...formData)
      this.driverService.SaveDriver(formData)
      .subscribe(
        ()=>{
          this.snackbar.open('Driver details added Successfully','',{duration : 1000});
         // this.createDriverForm.reset();
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
    this.router.navigate(['/driverdetails']);
  }

 
}
