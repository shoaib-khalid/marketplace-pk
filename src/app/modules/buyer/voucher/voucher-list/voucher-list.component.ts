import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerAuthenticate } from 'app/core/auth/auth.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VoucherModalComponent } from '../voucher-modal/voucher-modal.component';
import { VoucherService } from '../voucher.service';
import { CustomerVoucher, Voucher } from '../voucher.types';

@Component({
    selector     : 'voucher-list',
    templateUrl  : './voucher-list.component.html',
    styles       : [`

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
    
        
    `],
    encapsulation: ViewEncapsulation.None
})
export class VoucherListComponent implements OnInit, OnDestroy
{

    platform: Platform;
    inputPromoCode: string ='';
    customerAuthenticate: CustomerAuthenticate;

    customerVoucher: CustomerVoucher[] = [] ;
    usedCustomerVoucher: CustomerVoucher[] = [] ;


    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        public _dialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _voucherService: VoucherService,
        private _authService: AuthService,
        private _platformService : PlatformService,


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
        // don't display this, if you do, customer will see all the voucher code and get free item all the time la
        // this._voucherService.getAvailableVoucher().subscribe(response => {});

        this._authService.customerAuthenticate$
        .subscribe((response: CustomerAuthenticate) => {
            
            this.customerAuthenticate = response;                
        
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this._voucherService.customerVouchers$
        .subscribe((response: CustomerVoucher[]) => {

            this.customerVoucher = response;
            console.log('tinguk xguna', this.customerVoucher);
            
        });

        this._voucherService.usedCustomerVouchers$
        .subscribe((response: CustomerVoucher[]) => {

            this.usedCustomerVoucher = response;

            console.log('tinggukk:::::',this.usedCustomerVoucher);
        });

        this._platformService.platform$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: Platform) => {

            this.platform = response;
        });
           

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
      
    }

    enterPromoCode(){

        this._voucherService.postCustomerClaimVoucher(this.customerAuthenticate.session.ownerId, this.inputPromoCode)
        .subscribe((response) => {
            // if voucher is valid
            this.openVoucherModal('mat_solid:check_circle','Congratulations', 'Promo code successfully added', null);
            this.inputPromoCode = '';
            
        }, (error) => {
            // if voucher is invalid
            this.openVoucherModal('heroicons_outline:x','Invalid Code!', 'Please add valid code', null);
            this.inputPromoCode = '';
        });
    }

    openVoucherModal(icon: string, title: string, description: string, voucher: CustomerVoucher) : void {
        
        const dialogRef = this._dialog.open( 
        VoucherModalComponent,{
            data:{ 
                icon,
                title,
                description,
                voucher, 
            }
        });
        
        dialogRef.afterClosed().subscribe();
    }

}
