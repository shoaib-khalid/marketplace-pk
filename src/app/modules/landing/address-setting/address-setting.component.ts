import { DOCUMENT, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Loader } from '@googlemaps/js-api-loader';
import { AuthService } from 'app/core/auth/auth.service';
import { JwtService } from 'app/core/jwt/jwt.service';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { UserService } from 'app/core/user/user.service';
import { CustomerAddress } from 'app/core/user/user.types';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
// import { EditAddressDialog } from '../../user-profile/delivery-address/edit-address/edit-address.component';
import { DomSanitizer} from '@angular/platform-browser';
import { EditAddressDialog } from './edit-address/edit-address.component';

@Component({
    selector     : 'address-setting',
    templateUrl  : './address-setting.component.html',
    encapsulation: ViewEncapsulation.None,
    // styles        : [
    //     `
    //     .mat-dialog-container {
    //         padding: 10px !important;
    //         border-radius: 2 !important;

    //         @screen sm {
    //             padding: 24px !important;
    //             border-radius: 16px !important;
    //         }
    //     }
    //     `
    // ]

})


export class AddressSettingsComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    customersAddresses: CustomerAddress[];
    customerAddress: CustomerAddress = null;

    selectedAddress: CustomerAddress = null;
    
    accountForm: FormGroup;

    alert: any;
    currentScreenSize: string[] = [];

    url:any;


    /**
     * Constructor
     */
    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _formBuilder: FormBuilder,
        private _dialog: MatDialog,
        private _userService: UserService,
        private _jwtService: JwtService,
        private _authService: AuthService,
        private _domSanitizer: DomSanitizer,
        private _location: Location
    )
    {
    }

    ngOnInit(): void {

        this.url = this._domSanitizer.bypassSecurityTrustResourceUrl('https://maps.google.com/maps?q='+'3.060279,%20101.578040'+'&t=&z=15&ie=UTF8&iwloc=&output=embed');

        // Create the form
        this.accountForm = this._formBuilder.group({
            name    : ['', Validators.required],
            username: ['', Validators.required],
            email   : ['', [Validators.required, Validators.email]],
        
        });        

        // Customer Details
        this._userService.get(this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid)
            .subscribe((response)=>{
                this.accountForm.patchValue(response);
            })

        this._userService.customersAddresses$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((addresses: CustomerAddress[]) => {
                if(addresses){
                    this.customersAddresses = addresses;
                } 
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            this._userService.customerAddress$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((address: CustomerAddress) => {
                    if (address) {
                        this.selectedAddress = address;
                    }    
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

        // ----------------------
        // Fuse Media Watcher
        // ----------------------

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {               

                this.currentScreenSize = matchingAliases;                

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
    * Send the form
    */
    updateClientProfile(): void
    {
        // Do nothing if the form is invalid
        if ( this.accountForm.invalid )
        {
            return;
        }

        // Hide the alert
        this.alert = false;

        // Disable the form
        this.accountForm.disable();

        // update profile
        this._userService.putCustomerById(this.accountForm.value)
        .subscribe((response)=>{
            // Show a success message (it can also be an error message)
            if(response.status === 202)
            {
                const confirmation = this._fuseConfirmationService.open({
                    title  : 'Success',
                    message: 'Your profile has been updated successfully!',
                    icon: {
                        show: true,
                        name: "heroicons_outline:check",
                        color: "success"
                    },
                    actions: {
                        confirm: {
                            label: 'Ok',
                            color: "primary",
                        },
                        cancel: {
                            show: false,
                        },
                    }
                });
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
            
        })

        setTimeout(() => {
            this.alert = null;
        }, 7000);

        // Enable the form
        this.accountForm.enable();
    }
    addAddress() {
        const dialogRef = this._dialog.open( 
            EditAddressDialog, {
                width: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
                height: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
                maxWidth: this.currentScreenSize.includes('sm') ? 'auto' : '100vw',  
                maxHeight: this.currentScreenSize.includes('sm') ? 'auto' : '100vh',
                disableClose: true,
                data: {
                    type: "create",
                    customerId: this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid,
                    user: this.accountForm.value
                },
            }
        );    
        dialogRef.afterClosed().subscribe(result=>{
            if (result) {
                //Customer Addresses
                this._userService.createCustomerAddress(result)
                    .subscribe(()=>{});
            }
        });
    }

    editAddress(customerAddress: CustomerAddress){
        const dialogRef = this._dialog.open(
            EditAddressDialog, {
                width: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
                height: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
                maxWidth: this.currentScreenSize.includes('sm') ? 'auto' : '100vw',  
                maxHeight: this.currentScreenSize.includes('sm') ? 'auto' : '100vh',
                disableClose: true,
                data: {
                    type: "edit",
                    customerAddress: customerAddress
                }
            }
        );
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                // Customer Addresses
                this._userService.putCustomerAddressById(result).subscribe(()=>{});
            } 
        });        
    }

    deleteAddress(customerAddressId) {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete Address',
            message: 'Are you sure you want to remove this address? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                // Delete the customer on the server
                this._userService.deleteCustomerAddressById(customerAddressId)
                .subscribe(() => {});
            }
        });
    }

    setAsDefault(customerbody){
        // Customer Addresses
        this._userService.setDefaultCustomerAddressById(customerbody)
            .subscribe(()=>{});
    }

    selectAddress(addressId) {

        this._userService.getSelectedCustomerAddress(addressId)
        .subscribe(response=>{
            this.customerAddress = response
        })
    }

    backClicked() {
        this._location.back();
      }
    
}
