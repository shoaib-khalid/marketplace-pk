import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerAuthenticate } from 'app/core/auth/auth.types';
import { CartService } from 'app/core/cart/cart.service';
import { Cart, CartPagination } from 'app/core/cart/cart.types';
import { JwtService } from 'app/core/jwt/jwt.service';
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
    @ViewChild(MatPaginator) private _paginator: MatPaginator;

    platform: Platform;
    inputPromoCode: string ='';
    isLoading: boolean = false;
    pageOfItems: Array<any>;
    customerAuthenticate: CustomerAuthenticate;
    stores: Store[] = [];
    pagination: CartPagination;
    cart: Cart;
    carts: Cart[];
    totalCartItems: number;
    user: User;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    customerId: string = '';

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        public _dialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformService : PlatformService,
        private _cartService: CartService,
        private _storesService: StoresService,
        private _jwtService: JwtService,
        private _authService: AuthService

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
        this.customerId = this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid ? this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid : null

        this._cartService.carts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((carts: Cart[]) => {

                this.carts = carts
                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the orders pagination
        this._cartService.cartPagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: CartPagination) => {
            
            // Update the pagination
            this.pagination = pagination;
            
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });    

    }

    /**
    * After view init
    */
    ngAfterViewInit(): void
    {
        setTimeout(() => {
            if (this._paginator )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._paginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._cartService.getCarts(0, 4, null, this.customerId);
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);

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
        
        // update current page of items
        this.pageOfItems = pageOfItems;
        
        if(this.pagination && this.pageOfItems['currentPage']){

            if (this.pageOfItems['currentPage'] - 1 !== this.pagination.page) {
                // set loading to true
                this.isLoading = true;
                this._cartService.getCarts(this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'], null, this.customerId)
                    .subscribe((response)=>{
                            
                        // set loading to false
                        this.isLoading = false;
                    });
                    
            }
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();

    }

    redirectToStore(store: Store, cartId: string) {
        this._document.location.href = 'https://' + store.domain + '/checkout' +
         '?customerCartId=' + cartId;

    }

    displayStoreLogo(store: Store) {
        // let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (store.storeLogoUrl != null) {
            return store.storeLogoUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }
    deleteCart(cartId: string) {

        const confirmation = this._fuseConfirmationService.open({
                title  : 'Delete Cart',
                message: 'Are you sure you want to delete this cart?',
                icon:{
                    name:"mat_outline:delete_forever",
                    color:"primary"
                },
                actions: {
                    confirm: {
                        label: 'Delete',
                        color: 'warn'
                    }
                }
            });
        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
    
            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {

                this._cartService.deleteCart(cartId)
                    .subscribe(response => {

                        this._cartService.getCartsByCustomerId(this.customerId)
                            .subscribe()
                    })
            }
        });    
        
    }
}
