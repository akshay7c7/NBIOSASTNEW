import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SideNavService } from '../SideNav.service';
import { AuthService } from '../_services/auth.service';
import { DialogService } from '../_services/dialog.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['../app.component.css']
})
export class SidebarComponent implements OnInit {
  @ViewChild('drawer') public sidenav: MatDrawer;
  show : any;
  showWhilePrint : any
  constructor(public authService : AuthService, 
    private router : Router, 
              private snackbar : MatSnackBar,
              private sideNav : SideNavService, private dialogService : DialogService) { }

  ngOnInit() {

    this.showWhilePrint = false;
  }

  ngAfterViewInit(): void {
    this.sideNav.setSidenav(this.sidenav);
  }

  loggedIn()
  {
    this.show = this.authService.loggedIn();
    return(this.show);
  }

  showing = false
  showDrop()
  {
    this.showing=!this.showing
  }

  logout()
  {
    this.dialogService.openConfirmDialog("Do you wish to Logout?").afterClosed().subscribe(
      res=>{
        if(res)
        {
          if(this.authService.logout())
          {
            this.snackbar.open('Logged out successfully','',{duration: 1000})
            this.router.navigate(['/login']);
          }
        }
      }
    )
  }


  

}