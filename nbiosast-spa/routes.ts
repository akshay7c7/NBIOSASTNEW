import { Routes } from '@angular/router';
import { DashboardComponent } from 'src/app/dashboard/dashboard.component';
import { BranchDetailsShowComponent } from 'src/app/BranchDetailsShow/BranchDetailsShow.component';
import { ExpireCardDetailsComponent } from 'src/app/ExpireCardDetails/ExpireCardDetails.component';
import { AddDriverDetailsComponent } from 'src/app/AddDriverDetails/AddDriverDetails.component';
import { EditProfileComponent } from 'src/app/EditProfile/EditProfile.component';
import { LoginComponent } from 'src/app/login/login.component';
import { AuthGuard } from 'src/app/_guards/auth.guard';
import { EditPasswordComponent } from 'src/app/EditPassword/EditPassword.component';
import { EditResolver } from 'src/app/_resolvers/EditResolver';
import { DriverDetailsShowComponent } from 'src/app/DriverDetailsShow/DriverDetailsShow.component';
import { DriverDetailsEditComponent } from 'src/app/DriverDetailsShow/DriverDetailsEdit/DriverDetailsEdit.component';
import { ReportsComponent } from 'src/app/Reports/Reports.component';
import { AddAdminComponent } from 'src/app/AddAdmin/AddAdmin.component';
import { EditDriverResolver } from 'src/app/_resolvers/EditDriverResolver';
import { ShowAdminDetailsComponent } from 'src/app/ShowAdminDetails/ShowAdminDetails.component';
import { BranchDetailsResolver } from 'src/app/_resolvers/BranchDetailsResolver';

export const appRoutes : Routes = [

    {path : '', redirectTo : 'login', pathMatch : 'full'},
    {path : 'login' , component : LoginComponent },
    {
        
        path : '',
        runGuardsAndResolvers:"always",
        canActivate : [AuthGuard],
        children : [
           
            {path : 'dashboard' , component : DashboardComponent},
            {path : 'addadmin' , component : AddAdminComponent ,data: {roles: ['SuperAdmin','BranchAdmin']}},
            {path : 'showadmins', component: ShowAdminDetailsComponent},
            {path : 'branchdetails' , component : BranchDetailsShowComponent, resolve:{branchDetails : BranchDetailsResolver },data: {roles: ['SuperAdmin']}},
            {path : 'driverdetails' , component : DriverDetailsShowComponent } ,
            {path : 'adddriverdetails' , component : AddDriverDetailsComponent},
            {path : 'expirecards' , component : ExpireCardDetailsComponent},
            {path : 'editprofile' , component : EditProfileComponent, resolve:{editResolve:EditResolver}},
            {path : 'editpassword' , component : EditPasswordComponent},
            {path : 'editdriver/:id' , component : DriverDetailsEditComponent, resolve:{driverEditResolve : EditDriverResolver }},
            {path : 'reports', component: ReportsComponent},

        ]
    },
    {path : '**' , component : LoginComponent}
    
];

