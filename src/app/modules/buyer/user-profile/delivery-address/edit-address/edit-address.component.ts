import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.component.html',
})
export class EditAddressDialog implements OnInit {

    platform: Platform;
    addressForm: FormGroup;
    storeStates: string[] = [];

    countryName: string = '';
    countryCode: string = '';
    
    displayToogleNotDefault: boolean = false;
    isLoading: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<EditAddressDialog>,
        private _formBuilder: FormBuilder,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
        private _changeDetectorRef: ChangeDetectorRef,

    ) { }

    ngOnInit(): void {

        // Create the form
        this.addressForm = this._formBuilder.group({
            id          : [''],
            customerId  : ['', Validators.required],
            name        : ['', Validators.required],
            email       : ['', [Validators.required, Validators.email]],
            address     : ['', Validators.required],
            city        : ['', Validators.required],
            country     : ['', Validators.required],
            phoneNumber : ['', Validators.required],
            postCode    : ['', Validators.required],
            state       : ['', Validators.required],
            isDefault   : ['']
        });

        // Subscribe to platform data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                this.platform = platform;
            
                this.countryCode = this.platform.country;
                this.countryName = this.countryCode === 'MYS' ? 'Malaysia': 'Pakistan';
                
                // Get states by country Z(using symplified backend)
                this._storesService.getStoreRegionCountryState(this.countryCode)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response)=>{
                        this.storeStates = response; 
                        
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
        });


        if(this.data.type === "create"){
            this.addressForm.get('customerId').setValue(this.data.customerId);
            this.addressForm.get('isDefault').setValue(false);
            this.addressForm.get('country').setValue(this.countryName);
        } else {
            this.addressForm.patchValue(this.data.customerAddress);
            this.displayToogleNotDefault = this.addressForm.get('isDefault').value === false ? true : false;
        }
    }

    updateAddress(){
        this.dialogRef.close(this.addressForm.value);
    }

    closeDialog(){
        this.dialogRef.close();
    }

}
