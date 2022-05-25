import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { City } from 'app/core/store/store.types';
import { Observable, ReplaySubject, Subject, takeUntil, take } from 'rxjs';
import { UserProfileValidationService } from '../../user-profile.validation.service';


@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.component.html',
})
export class EditAddressDialog implements OnInit {

    /** control for the selected bank for multi-selection */
    public regionCountryStateCities: FormControl = new FormControl();

    private _onDestroy = new Subject<void>();
    public filteredCities: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    @ViewChild('stateCitySelector') stateCitySelector: MatSelect;

    storeStateCities: string[] = [];
    storeStateCities$: Observable<City[]>;

    platform: Platform;
    addressForm: FormGroup;
    storeStates: string[] = [];

    countryName: string = '';
    countryCode: string = '';
    
    displayToogleNotDefault: boolean = false;
    isLoading: boolean = false;

    dialingCode: string;

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
            email       : [''],
            address     : ['', Validators.required],
            city        : ['', Validators.required],
            country     : ['', Validators.required],
            phoneNumber : ['', [UserProfileValidationService.phonenumberValidator, Validators.maxLength(30)]],
            postCode    : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5), UserProfileValidationService.postcodeValidator]],
            state       : ['Selangor', Validators.required],
            isDefault   : ['']
        });
        
        this.setInitialValue();

        // set initial selection
        this.regionCountryStateCities.setValue([]);
        // load the initial bank list
        // this.filteredCities.next(this.cities.slice());

        this.regionCountryStateCities.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((result) => {                
                // Get states by country Z(using symplified backend)
                this._storesService.getStoreRegionCountryStateCity(this.addressForm.get('state').value, result )
                .subscribe((response)=>{
                    // Get the products
                    this.storeStateCities$ = this._storesService.cities$;                    

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            });

        this.addressForm.get('state').valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((result) => {
                
                // Get states by country Z(using symplified backend)
                this._storesService.getStoreRegionCountryStateCity(result)
                .subscribe((response)=>{
                    // Get the products
                    this.storeStateCities$ = this._storesService.cities$;                    

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            });

        // Subscribe to platform data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                this.platform = platform;
            
                this.countryCode = this.platform.country;
                this.countryName = this.countryCode === 'MYS' ? 'Malaysia': 'Pakistan';

                // -------------------------
                // Set Dialing code
                // -------------------------
                
                let countryId = this.countryCode;
                switch (countryId) {
                    case 'MYS':
                        this.dialingCode = '60'
                        break;
                    case 'PAK':
                        this.dialingCode = '92'
                        break;
                    default:
                        break;
                }
                
                // Get states by country Z(using symplified backend)
                this._storesService.getStoreRegionCountryState(this.countryCode)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response)=>{
                        this.storeStates = response; 
                        
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                let symplifiedCountryStateId = this.addressForm.get('state').value;

                // Get city by state
                this._storesService.getStoreRegionCountryStateCity(symplifiedCountryStateId)
                .subscribe((response)=>{
                    // Get the products
                    this.storeStateCities$ = this._storesService.cities$;                        

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });


        if(this.data.type === "create"){
            this.addressForm.get('customerId').setValue(this.data.customerId);
            this.addressForm.get('isDefault').setValue(false);
            this.addressForm.get('country').setValue(this.countryName);
            this.addressForm.get('email').setValue(this.data.user.email);
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

    sanitizePhoneNumber(phoneNumber: string) {

        if (phoneNumber.match(/^\+?[0-9]+$/)) {

            let substring = phoneNumber.substring(0, 1)
            let countryId = this.countryCode;
            let sanitizedPhoneNo = ''
            
            if ( countryId === 'MYS' ) {
    
                     if (substring === '6') sanitizedPhoneNo = phoneNumber;
                else if (substring === '0') sanitizedPhoneNo = '6' + phoneNumber;
                else if (substring === '+') sanitizedPhoneNo = phoneNumber.substring(1);
                else                        sanitizedPhoneNo = '60' + phoneNumber;
    
            }
            else if ( countryId === 'PAK') {
    
                     if (substring === '9') sanitizedPhoneNo = phoneNumber;
                else if (substring === '2') sanitizedPhoneNo = '9' + phoneNumber;
                else if (substring === '+') sanitizedPhoneNo = phoneNumber.substring(1);
                else                        sanitizedPhoneNo = '92' + phoneNumber;
    
            }
    
            return sanitizedPhoneNo;
        }
        else {
            return phoneNumber;
        }

    }

    private setInitialValue() {
        this.filteredCities
            .pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                this.stateCitySelector.compareWith = (a: any, b: any) => a === b;
            });
    }

}
