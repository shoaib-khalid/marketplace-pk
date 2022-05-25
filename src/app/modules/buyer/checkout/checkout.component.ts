import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DOCUMENT } from '@angular/common'; 
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cart.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreSnooze, StoreTiming } from 'app/core/store/store.types';
import { of, Subject, Subscription, timer, interval as observableInterval, BehaviorSubject } from 'rxjs';
import { takeWhile, scan, tap } from "rxjs/operators";
import { map, switchMap, takeUntil, debounceTime, filter, distinctUntilChanged } from 'rxjs/operators';
import { CheckoutService } from './checkout.service';
import { CheckoutValidationService } from './checkout.validation.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Address } from './checkout.types';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ModalConfirmationDeleteItemComponent } from './modal-confirmation-delete-item/modal-confirmation-delete-item.component';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerAuthenticate } from 'app/core/auth/auth.types';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector     : 'buyer-checkout',
    templateUrl  : './checkout.component.html',
    styles       : [
        `
            /** Custom input number **/
            input[type='number']::-webkit-inner-spin-button,
            input[type='number']::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
            }
        
            .custom-number-input input:focus {
            outline: none !important;
            }
        
            .custom-number-input button:focus {
            outline: none !important;
            }

            ::ng-deep .mat-radio-button .mat-radio-ripple{
                display: none;
            }

            .map {
                width: 50vw;
                height: 50vh;
            }
            #pac-input {
                background-color: #fff;
                font-family: Roboto;
                font-size: 15px;
                font-weight: 300;
                padding: 0 11px 0 13px;
                text-overflow: ellipsis;
                width: 400px;
                height: 40px;
            }
              
            #pac-input:focus {
                border-color: #4d90fe;
                padding: 5px 5px 5px 5px;
            }
            
            .pac-controls {
                padding: 5px 11px;
                display: inline-block;
            }
              
            .pac-controls label {
                font-family: Roboto;
                font-size: 13px;
                font-weight: 300;
            }

        `
    ]
})
export class BuyerCheckoutComponent implements OnInit
{

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('checkoutNgForm') signInNgForm: NgForm;
    @ViewChild('checkoutContainer') checkoutContainer: ElementRef;
    
    checkoutForm: FormGroup;

    currentScreenSize: string[] = [];

    inputPromoCode:string ='';
    discountAmountVoucherApplied: number = 0.00;
    displaydiscountAmountVoucherApplied:any = 0.00;
    customerAuthenticate: CustomerAuthenticate;
    user: any;
    customerAddresses: Address[] = [];

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,

        private _checkoutService: CheckoutService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _authService: AuthService,
        private _userService: UserService,

        private _datePipe: DatePipe,
        private _dialog: MatDialog,
        private _router: Router,
        @Inject(DOCUMENT) document: Document
    )
    {
    }

    ngOnInit() {

        // Create the support form
        this.checkoutForm = this._formBuilder.group({
            // Main Store Section
            id                  : ['undefined'],
            fullName            : ['', Validators.required],
            // firstName           : ['', Validators.required],
            // lastName            : ['', Validators.required],
            email               : ['', [Validators.required, CheckoutValidationService.emailValidator]],
            phoneNumber         : ['', CheckoutValidationService.phonenumberValidator],
            address             : ['', Validators.required],
            storePickup         : [false],
            postCode            : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10), CheckoutValidationService.postcodeValidator]],
            state               : ['', Validators.required],
            city                : ['', Validators.required],
            deliveryProviderId  : ['', CheckoutValidationService.deliveryProviderValidator],
            country             : [''],
            regionCountryStateId: [''],
            specialInstruction  : [''],
            saveMyInfo          : [true]
        });

        this._authService.customerAuthenticate$
        .subscribe((response: CustomerAuthenticate) => {
            
            this.customerAuthenticate = response;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        // Get customer Addresses
        this._checkoutService.customerAddresses$
        .subscribe((response: Address[]) => {
            
            this.customerAddresses = response
            
        });

        this._userService.get(this.customerAuthenticate.session.ownerId)
        .subscribe((response)=>{

            this.user = response.data
 
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

    displayError(message: string) {
        const confirmation = this._fuseConfirmationService.open({
            "title": "Error",
            "message": message,
            "icon": {
            "show": true,
            "name": "heroicons_outline:exclamation",
            "color": "warn"
            },
            "actions": {
            "confirm": {
                "show": true,
                "label": "OK",
                "color": "warn"
            },
            "cancel": {
                "show": false,
                "label": "Cancel"
            }
            },
            "dismissible": true
        });

        return confirmation;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    redeemPromoCode(){

        // dummy data promo code available
        let voucherCodes =[
            'FREESHIPPING',
            'RAYADEALS'
        ]

        //IF VOUCHER EXIST
        if(voucherCodes.includes(this.inputPromoCode)){
            const confirmation = this._fuseConfirmationService.open({
                title  : '', 
                message: 'Voucher code applied',
                icon       : {
                    show : false,
                },
                actions: {
                    confirm: {
                        label: 'OK',
                        color: 'primary'
                    },
                    cancel : {
                        show : false,
                    }
                }
            });
            //to show the dusocunted price when voucher applied
            this.discountAmountVoucherApplied = 10.50;
            this.displaydiscountAmountVoucherApplied = this.discountAmountVoucherApplied.toFixed(2) 
           
        } 
        else{
            const confirmation = this._fuseConfirmationService.open({
                title  : '',
                message: 'Invalid code, please try again',
                icon       : {
                    show : false,
                },
                actions: {
                    confirm: {
                        label: 'OK',
                        color: 'primary'
                    },
                    cancel : {
                        show : false,
                    }
                }
            });
        }
    }

    selectOnVoucher(value:string){

        //to show the disocunted price when voucher applied
        this.discountAmountVoucherApplied = parseFloat(value);
        this.displaydiscountAmountVoucherApplied = this.discountAmountVoucherApplied.toFixed(2) 
                  
    }
}
