import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.component.html',
})
export class EditAddressComponent implements OnInit {

  addressId: string ="";

  addressForm: FormGroup;

  storeStates: string[] = [];

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  platform: Platform;

  countryCode : string = '';
  countryName: string =';'


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    public dialogRef: MatDialogRef<EditAddressComponent>,
    private _storesService: StoresService,
    private _platformsService: PlatformService,
    private _changeDetectorRef: ChangeDetectorRef,

  ) { }

  ngOnInit(): void {

    // Create the form
    this.addressForm = this._formBuilder.group({
      name    : ['', Validators.required],
      email   : ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      customerId: ['', Validators.required],
      id: ['', Validators.required],
      isDefault: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      postCode: ['', Validators.required],
      state: ['', Validators.required]
    });



    // Subscribe to platform data
    this._platformsService.platform$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((platform: Platform) => {
            this.platform = platform;
          

            this.countryCode = this.platform.country;
            this.countryName = this.countryCode === 'MYS'? 'Malaysia': 'Pakistan';

    });

    // Get states by country Z(using symplified backend)
    this._storesService.getStoreRegionCountryState(this.countryCode)
    .subscribe((response)=>{
        this.storeStates = response; 
        
        // Mark for check
        this._changeDetectorRef.markForCheck();
    });

    if(this.data ==='create'){
      this.addressForm.get('isDefault').setValue(false);
      this.addressForm.get('country').setValue(this.countryName);


    }
    else{

      this.addressForm.patchValue(this.data);


    }
    
  }

  updateAddress(){

    this.dialogRef.close(this.addressForm.value);
  }

  closeDialog(){
    this.dialogRef.close();
  }

}
