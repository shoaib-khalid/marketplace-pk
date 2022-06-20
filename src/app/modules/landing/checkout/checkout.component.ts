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
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector     : 'buyer-checkout',
    templateUrl  : './checkout.component.html',
    styles       : [
        /* language=SCSS */
        `
            .cart-grid {
                grid-template-columns: 24px auto 96px 96px 96px 30px;

                @screen md {
                    grid-template-columns: 24px auto 112px 112px 112px 30px;
                }
            }

            .cart-title-grid {
                grid-template-columns: 24px auto;

                @screen sm {
                    grid-template-columns: 24px auto;
                }
            }

            .mat-tab-group {

                /* No header */
                &.fuse-mat-no-header {
            
                    .mat-tab-header {
                        height: 0 !important;
                        max-height: 0 !important;
                        border: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                    }
                }
            
                .mat-tab-header {
                    border-bottom: flex !important;
            
                    .mat-tab-label-container {
                        padding: 0 0px;
            
                        .mat-tab-list {
            
                            .mat-tab-labels {
            
                                .mat-tab-label {
                                    min-width: 0 !important;
                                    height: 40px !important;
                                    padding: 0 20px !important;
                                    @apply text-secondary;
            
                                    &.mat-tab-label-active {
                                        @apply bg-primary-700 bg-opacity-0 dark:bg-primary-50 dark:bg-opacity-0 #{'!important'};
                                        @apply text-primary #{'!important'};
                                    }
            
                                    + .mat-tab-label {
                                        margin-left: 0px;
                                    }
            
                                    .mat-tab-label-content {
                                        line-height: 20px;
                                    }
                                }
                            }
            
                            .mat-ink-bar {
                                display: flex !important;
                            }
                        }
                    }
                }
            
                .mat-tab-body-content {
                    padding: 0px;
                }
            }

            /** Custom input number **/
            input[type='number']::-webkit-inner-spin-button,
            input[type='number']::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
    
            input[type='number'] {
                -moz-appearance:textfield;
            }
          
            .custom-number-input input:focus {
              outline: none !important;
            }
          
            .custom-number-input button:focus {
              outline: none !important;
            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    animations     : fuseAnimations
})
export class BuyerCheckoutComponent implements OnInit
{

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('checkoutNgForm') signInNgForm: NgForm;
    @ViewChild('checkoutContainer') checkoutContainer: ElementRef;
    
    checkoutForm: FormGroup;

    quantity: number = 1;
    minQuantity: number = 1;
    maxQuantity: number = 999;

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

    checkQuantity(operator: string = null) {
        if (operator === 'decrement')
            this.quantity > this.minQuantity ? this.quantity -- : this.quantity = this.minQuantity;
        else if (operator === 'increment')
            this.quantity < this.maxQuantity ? this.quantity ++ : this.quantity = this.maxQuantity;
        else {
            if (this.quantity < this.minQuantity) 
                this.quantity = this.minQuantity;
            else if (this.quantity > this.maxQuantity)
                this.quantity = this.maxQuantity;
        }
    }
}
