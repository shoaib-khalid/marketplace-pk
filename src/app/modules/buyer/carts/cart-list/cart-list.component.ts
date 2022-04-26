import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerAuthenticate } from 'app/core/auth/auth.types';
import { CartService } from 'app/core/cart/cart.service';
import { Cart } from 'app/core/cart/cart.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets } from 'app/core/store/store.types';
import { User } from 'app/core/user/user.types';
import { merge, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector     : 'cart-list',
    templateUrl  : './cart-list.component.html',
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
export class CartListComponent implements OnInit, OnDestroy
{
    // @ViewChild("customerVoucher", {read: MatPaginator}) private _customerVoucherPagination: MatPaginator;
    // @ViewChild("usedCustomerVoucher", {read: MatPaginator}) private _usedCustomerVoucherPagination: MatPaginator;

    platform: Platform;
    inputPromoCode: string ='';
    isLoading: boolean = false;
    pageOfItems: Array<any>;
    customerAuthenticate: CustomerAuthenticate;
    stores: Store[] = [];

    cart: Cart;
    carts: Cart[];
    totalCartItems: number;
    user: User;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        public _dialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _authService: AuthService,
        private _platformService : PlatformService,
        private _cartService: CartService,
        private _storesService: StoresService

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

        this._cartService.customerCarts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((carts: Cart[]) => {
                this.carts = carts["cartList"];
                this.totalCartItems = carts["totalItem"];

                // remove duplicate stores
                let resArr = [];
                this.carts.filter(function(item){

                    let i = resArr.findIndex(x => (x.storeId == item.storeId));

                    if (i <= -1){
                        resArr.push(item);
                    }
                    return null;
                });
                this.carts = resArr;

                this.carts.forEach(cart => {

                    this._storesService.getStoreById(cart.storeId) 
                    .subscribe((store: Store)=>{
                        if (store){
                            this.stores.push(store);
                        }
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
                }) 
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    /**
    * After view init
    */
    ngAfterViewInit(): void
    {
        /*
        setTimeout(() => {
            if (this._customerVoucherPagination )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._customerVoucherPagination.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._vouchersService.getAvailableCustomerVoucher(false, 0, 10);
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }

            if (this._usedCustomerVoucherPagination )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._usedCustomerVoucherPagination.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._vouchersService.getAvailableCustomerVoucher(true, 0, 10);
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);

        */
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

    onChangePage(pageOfItems: Array<any>) {

        /*
        
        // update current page of items
        this.pageOfItems = pageOfItems;
        
        if(this.customerVoucherPagination && this.pageOfItems['currentPage']){

            if (this.pageOfItems['currentPage'] - 1 !== this.customerVoucherPagination.page) {
                // set loading to true
                this.isLoading = true;
    
                this._vouchersService.getAvailableCustomerVoucher(false,this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'])
                    .subscribe((response)=>{
                            
                        // set loading to false
                        this.isLoading = false;
                    });
                    
            }
        }

        if(this.usedCustomerVoucherPagination && this.pageOfItems['currentPage']){

            if (this.pageOfItems['currentPage'] - 1 !== this.usedCustomerVoucherPagination.page) {
                // set loading to true
                this.isLoading = true;
    
                this._vouchersService.getAvailableCustomerVoucher(true,this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'])
                    .subscribe((response)=>{
                        
                        // set loading to false
                        this.isLoading = false;
                    });
                    
            }
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();

        */
    }

    redirectToStore(store: Store) {
        this._document.location.href = 'https://' + store.domain + '/checkout'
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }

}
