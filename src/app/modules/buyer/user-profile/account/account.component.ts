import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AuthService } from 'app/core/auth/auth.service';
import { JwtService } from 'app/core/jwt/jwt.service';
import { UserService } from 'app/core/user/user.service';
import { CustomerAddress, HttpResponsePagination } from 'app/core/user/user.types';
import { Observable, Subject, takeUntil } from 'rxjs';
import { EditAddressComponent } from './edit-address/edit-address.component';
// import { Client } from '../edit-profile/edit-profile.types';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';


@Component({
    selector       : 'settings-account',
    templateUrl    : './account.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAccountComponent implements OnInit
{
    alert: any;
    accountForm: FormGroup;
    clientId: string;
    customerAddress:any=[];

    customersAddress$: Observable<CustomerAddress[]>;
    setCustomerDefaultAddress:any;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    currentScreenSize: string[] = [];

    // client: Client;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _userService: UserService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        public _dialog: MatDialog,
        private _jwtService: JwtService,
        private _authService: AuthService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,


    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.accountForm = this._formBuilder.group({
            name    : ['', Validators.required],
            username: ['', Validators.required],
            email   : ['', [Validators.required, Validators.email]],
       
        });

    
        // ----------------------
        // Get client Details
        // ----------------------

        //Customer Details
        this._userService.get(this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid)
        .subscribe((resp)=>{
            this.accountForm.patchValue(resp.data);
        })

        // Get the discounts
        this.customersAddress$ = this._userService.customersAddress$;

        // Customer Addresses
        this._userService.getCustomerAddress().subscribe();

        this._fuseMediaWatcherService.onMediaChange$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(({matchingAliases}) => {               

            this.currentScreenSize = matchingAliases;                

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();

    }

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

    editAddress(customerAddress:CustomerAddress){
        
        const dialogRef = this._dialog.open(
            EditAddressComponent, {
                width: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
                height: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
                maxWidth: this.currentScreenSize.includes('sm') ? 'auto' : '100vw',  
                maxHeight: this.currentScreenSize.includes('sm') ? 'auto' : '100vh',
                // disableClose: true,
                data: customerAddress,
                });
            
        dialogRef.afterClosed().subscribe(result=>{
    
            if(result){
                //Customer Addresses
                this._userService.putCustomerAddressById(result).subscribe(
                  (res)=>{
         
                    }
                  )
            }

            
        });
    
    
        
    }

    deleteAddress(customerAddressId){

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
                this._userService.deleteCustomerAddressById(customerAddressId).subscribe(() => {

                });
            }
        });
        
    }

    addAddress(){

        const dialogRef = this._dialog.open(
            EditAddressComponent, {
                width: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
                height: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
                maxWidth: this.currentScreenSize.includes('sm') ? 'auto' : '100vw',  
                maxHeight: this.currentScreenSize.includes('sm') ? 'auto' : '100vh',
                // disableClose: true,
                data: 'create',
                });
        
                          
        dialogRef.afterClosed().subscribe(result=>{
            
            if(result){

                //Customer Addresses
                this._userService.createCustomerAddress(result).subscribe(
                    (res)=>{
        
                    
                    }
                )
            }
           
        });
    }

    setAsDefault(customerbody){

        // this.setCustomerDefaultAddress =customerbody;
        // this.setCustomerDefaultAddress.isDefault = true;
    
        console.log('dddd',customerbody);

  
        // const defaultPayload = customerbody;
        // defaultPayload.isDefault = true;
        // console.log('dddd',defaultPayload);
        // console.log('rerrer',customerbody);

        
        //Customer Addresses
        // this._userService.putCustomerAddressById(this.setCustomerDefaultAddress).subscribe(
        // (res)=>{

        //     }
        // )


    }
    
}