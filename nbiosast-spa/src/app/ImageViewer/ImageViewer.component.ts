import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Driver } from '../_models/Driver';
import { DriverService } from '../_services/driver.service';

@Component({
  selector: 'app-ImageViewer',
  templateUrl: './ImageViewer.component.html',
  styleUrls: ['./ImageViewer.component.scss']
})
export class ImageViewerComponent implements OnInit {

  constructor(private http : HttpClient, 
    private activatedRoute : ActivatedRoute,
    private driverServie : DriverService,
    @Inject(MAT_DIALOG_DATA) public data)
     { }

  isloading=false
  public driver ={};
  public driverClass : Driver = {} as Driver;
  showDoc = false
  showCer = false
  ngOnInit() {
    if(this.data.type == "cer")
    {
      this.showCer = true
    }
    else{
      this.showDoc= true;
    }

    this.driverServie.getDriver(this.data.id)
    .subscribe(
      data=>{
        this.driver = data;
        this.driverClass =Object.assign({},this.data)
        this.isloading = true;
      console.log(data)},
      error=>console.log(error.error)
    )
  }

}
