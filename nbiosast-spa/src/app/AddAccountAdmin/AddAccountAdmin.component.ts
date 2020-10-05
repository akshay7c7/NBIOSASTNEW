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
  selector: 'app-AddAccountAdmin',
  templateUrl: './AddAccountAdmin.component.html',
  styleUrls: ['../app.component.css']
})
export class AddAccountAdminComponent implements OnInit {

  @ViewChild('inputcity') inpElementRef : ElementRef
  inpElement : HTMLElement;
  myControl = new FormControl();
  city = this.cityService.cities;
  options : string[] =[];
  filteredOptions: Observable<string[]>;

  constructor(private fb : FormBuilder, 
              public authService : AuthService,
              private snackbar : MatSnackBar,
              private router : Router,
              private cityService: City,
              private userService : UserService) { }
  
  ngOnInit() {

    this.userService.GetUserDetail(this.authService.decodedToken.nameid)
    .subscribe(
      data=>
      {
        console.log(data);
        if(this.authService.decodedToken?.role.length ==3)
        {
          this.currentCity = "";
        }
        else
        {
          this.currentCity = data['city']
        }
        
      }
    )

    for (var product of this.city) {
      this.options.push(product.name);
      }

    

    this.CreateAddAccountAdmin();

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );    
  }

  createAccountAdminForm : FormGroup; 
  currentCity
  currentBranch
  
  user : User ={} as User;

  private _filter(value: string)
  { 
    if(value!==null)
    {
      const filterValue = value.toLowerCase();
      return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
    }
    
  }

  CreateAddAccountAdmin()
  {
    this.createAccountAdminForm = this.fb.group(
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

  fromCity:string="";
  RegisterAccountAdmin()
  {
    if(this.createAccountAdminForm.valid)
    {
        this.user = Object.assign({},this.createAccountAdminForm.value)
        this.authService.registerAccountAdmin(this.user)
        .subscribe(
          ()=>{this.snackbar.open('Account Admin Created Successfully','',{duration : 1000});
                this.createAccountAdminForm.reset();},
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
    this.createAccountAdminForm.reset();
    this.router.navigate(['/showaccountadmin']);
  }






}
