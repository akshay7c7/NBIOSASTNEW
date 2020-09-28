import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from '../_models/user';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { AuthService } from '../_services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { City } from '../_services/cities';
import { Router } from '@angular/router';

@Component({
  selector: 'app-AddBranchAdmin',
  templateUrl: './AddBranchAdmin.component.html',
  styleUrls: ['../app.component.css']
})

export class AddBranchAdminComponent implements OnInit {


  myControl = new FormControl();
  city = this.cityService.cities;
  options : string[] =[];
  filteredOptions: Observable<string[]>;


  constructor(private fb : FormBuilder, 
    private route : Router,
    private authService : AuthService,
    private snackbar : MatSnackBar,
    private cityService: City ) { }

ngOnInit() {

  for (var product of this.city) {
    this.options.push(product.name);
    }

  this.CreateAddBranchAdmin();
  this.filteredOptions = this.myControl.valueChanges.pipe(
    startWith(''),
    map(value => this._filter(value))
  );
  
  
}

  
  createBranchAdminForm : FormGroup; 
  user : User;


 
 private _filter(value: string)
  { 
    if(value!==null)
    {
      const filterValue = value.toLowerCase();
      return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
    }
    
}

  
  

fromCity:string="";
  CreateAddBranchAdmin()
  {
        this.createBranchAdminForm = this.fb.group
        (
            {
              name : ['',Validators.required],
              username : ['',Validators.required],
              email : ['',Validators.required],
              phoneNumber :['',Validators.required],
              city : [this.fromCity, Validators.required],
              password : ['', [Validators.required, Validators.minLength(4),Validators.maxLength(10)]],
              cpassword : ['',Validators.required]
            },
            {
              validator : this.passwordMatchValidator
            }
        )
  }


  passwordMatchValidator(g : FormGroup)
  {
    return g.get('password').value === g.get('cpassword').value ? null : {'mismatch':true};
  }

  RegisterBranchAdmin()
  {
    
    if(this.createBranchAdminForm.valid)
      {console.log("inside")
        this.user = Object.assign({},this.createBranchAdminForm.value);

        this.authService.registerBranchAdmin(this.user)
        .subscribe(
          ()=>{
            this.snackbar.open('Branch Admin Created Successfully','',{duration : 1000});
            this.createBranchAdminForm.reset();
              },
              
          error =>{
            console.log(error)
            this.snackbar.open(error.error,'',{duration : 1000});}
                  )
      }
    else{
      this.snackbar.open('Validation Error','',{duration : 1000});
    } 

  }

  Cancel()
  {
    this.createBranchAdminForm.reset();
    this.route.navigate(['/branchdetails'])
  }

 

}