import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { User } from '../_models/user';
import { AuthService } from '../_services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { City } from '../_services/cities';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-AddAdmin',
  templateUrl: './AddAdmin.component.html',
  styleUrls: ['./AddAdmin.component.css']
})
export class AddAdminComponent implements OnInit {

  myControl = new FormControl();
  city = this.cityService.cities;
  options : string[] =[];
  filteredOptions: Observable<string[]>;
  currentUser:User = {} as User
  constructor(private fb : FormBuilder, 
              public authService : AuthService,
              private snackbar : MatSnackBar,
              private router : Router,
              private cityService: City,
              private userService : UserService) { }
  
  ngOnInit() {

    
    if(this.authService.decodedToken?.role.length==4)
    {
      
      this.currentCity = ""
      this.AdminValue=3;
    }
    else
    {
      this.currentUser =JSON.parse(localStorage.getItem('user'))
      console.log(this.currentUser)
      this.currentCity = this.currentUser.city
      this.AdminValue=2;
    }

    for (var product of this.city)
    {
      this.options.push(product.name);
    }

    this.CreateAdmin();

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );    
  }


  createAdminForm : FormGroup; 
 
  currentCity: string
  
  user : User ={} as User;

  private _filter(value: string)
  { 
    if(value!==null)
    {
      const filterValue = value.toLowerCase();
      return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
    }
    
  }

  AdminValue;
  SelectAdmin(event)
  {
    this.AdminValue = event.target.value;
    console.log(this.AdminValue)
  }

  CreateAdmin()
  {
    this.createAdminForm = this.fb.group(
      {
        name : ['',Validators.required],
        username : ['',Validators.required],
        email : ['',Validators.required],
        phoneNumber :['',Validators.required],
        city : [this.fromCity, Validators.required],
        password : ['', [Validators.required, Validators.minLength(4),Validators.maxLength(10)]],
        cpassword : ['',Validators.required],
        admin :['Select Admin']
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

  fromCity:string="";
  RegisterAccountAdmin()
  {
    if(this.createAdminForm.valid)
    {
      var admin;
      if(this.AdminValue == 1)
      {
        admin = "Driver"
      }
      else if(this.AdminValue == 2)
      {
        admin = "Account"
      }
      else if(this.AdminValue == 3)
      {
        admin = "Branch"
      }
      else{
        admin = "Super"
      }

      
        this.user = Object.assign({},this.createAdminForm.value)
        this.authService.registerAdmin(this.AdminValue,this.user)
        .subscribe(
          ()=>{this.snackbar.open(admin + ' admin created Successfully','',{duration : 1000});
                this.createAdminForm.reset();
              },
          error =>{
            console.log(error)
            this.snackbar.open(error.error,'',{duration : 1000})}
        )
    }
    else
    {
      console.log("False not valid")
    }

  }

  Cancel()
  {
    this.createAdminForm.reset();
    this.router.navigate(['/showaccountadmin']);
  }

}

