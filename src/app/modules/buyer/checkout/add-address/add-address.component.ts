import { PlatformLocation } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerAuthenticate } from 'app/core/auth/auth.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { CheckoutService } from '../checkout.service';
import { CheckoutValidationService } from '../checkout.validation.service';

@Component({
  selector: 'add-address',
  templateUrl: './add-address.component.html'
})
export class AddAddressComponent implements OnInit {

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  createAddressForm: FormGroup;
  platform: Platform;

  showButton: boolean = false;
  addresses: string[];
  selectedAddressId: string;

  customerAuthenticate: CustomerAuthenticate;
  user: any;
  state: any;
  regionCountryStates: any;

  constructor(
    private dialogRef: MatDialogRef<AddAddressComponent>,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _checkoutService: CheckoutService,
    private _authService: AuthService,
    private _userService: UserService,
    private _platformsService: PlatformService,


    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {

    // Create the support form
    this.createAddressForm = this._formBuilder.group({
      // Main Store Section
      fullName            : ['', Validators.required],
      email               : ['', [Validators.required, CheckoutValidationService.emailValidator]],
      phoneNumber         : ['', CheckoutValidationService.phonenumberValidator],
      address             : ['', Validators.required],
      postCode            : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10), CheckoutValidationService.postcodeValidator]],
      state               : ['', Validators.required],
      city                : ['', Validators.required],
    });

    this._authService.customerAuthenticate$
    .subscribe((response: CustomerAuthenticate) => {
        
      this.customerAuthenticate = response;   

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });

    this._userService.get(this.customerAuthenticate.session.ownerId)
      .subscribe((response)=>{

        this.user = response.data
    
        this._platformsService.platform$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((platform: Platform) => { 

          this.platform = platform;

          this._changeDetectorRef.markForCheck();

        });
        
        // Get states
        this._checkoutService.getStoreRegionCountryState(this.platform.country)
        .subscribe((response)=>{
          
          this.regionCountryStates = response;
          console.log('this.regionCountryStates',this.regionCountryStates);
          

          // Mark for check
          this._changeDetectorRef.markForCheck();
        })
          
      }
    );

  }

  cancel() {
    this.dialogRef.close({isAddress: false});
  }

  // chooseAddress() {

  //   let _addresses = this.data.customerAddress;
  //   let index = _addresses.findIndex(item => item.id === this.selectedAddressId);
    
  //   if (index > -1) {
  //     const address = _addresses[index];
  //     address["isAddress"] = true;
  //     this.dialogRef.close(address);
  //   } else {
  //     this.dialogRef.close({isAddress: false});
  //   }
  // }

  createAddress() {

    const createAddressBody = {
      name       : this.createAddressForm.get('fullName').value,
      address    : this.createAddressForm.get('address').value,
      city       : this.createAddressForm.get('city').value,
      country    : this.state,
      customerId : this.user.id,
      email      : this.createAddressForm.get('email').value,
      phoneNumber: this.createAddressForm.get('phoneNumber').value,
      postCode   : this.createAddressForm.get('postCode').value,
      state      : this.createAddressForm.get('state').value,
    }

    this._checkoutService.postCustomerAddress(this.user.id, createAddressBody)
    .subscribe((response) => {

    });

    this.dialogRef.close();
  }

}
