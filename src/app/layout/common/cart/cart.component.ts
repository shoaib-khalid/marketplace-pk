import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';
import { Subject, takeUntil } from 'rxjs';
import { Cart } from 'app/core/cart/cart.types';
import { UserService } from 'app/core/user/user.service';
import { CustomerAuthenticate } from 'app/core/auth/auth.types';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { User } from 'app/core/user/user.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets } from 'app/core/store/store.types';
import { DOCUMENT } from '@angular/common';



@Component({
    selector       : 'cart',
    templateUrl    : './cart.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'cart'
})
export class CartComponent implements OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = true;
    cart: Cart;
    carts: Cart[];
    totalCartItems: number;
    user: User;
    seeMoreCarts: boolean = true;
    customer:any;
    customerAuthenticate: CustomerAuthenticate;


    private _unsubscribeAll: Subject<any> = new Subject<any>();
    stores: Store[] = [];

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _cartService: CartService,
        private _authService: AuthService,
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
     * Sign out
     */
    signOut(): void
    {
        this._router.navigate(['/sign-out']);
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
