import { CurrencyPipe, DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { Cart, CartWithDetails, CartPagination, CartItem } from 'app/core/cart/cart.types';
import { ModalConfirmationDeleteItemComponent } from 'app/modules/landing/carts/modal-confirmation-delete-item/modal-confirmation-delete-item.component';
import { JwtService } from 'app/core/jwt/jwt.service';
import { Platform } from 'app/core/platform/platform.types';
import { Store } from 'app/core/store/store.types';
import { fuseAnimations } from '@fuse/animations';
import { merge, pipe, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { CartDiscount, DeliveryProvider } from '../checkout/checkout.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { UserService } from 'app/core/user/user.service';
import { CustomerAddress } from 'app/core/user/user.types';
import { CheckoutService } from '../checkout/checkout.service';

@Component({
    selector     : 'carts',
    templateUrl  : './carts.component.html',
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
export class CartListComponent implements OnInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;

    platform: Platform;

    // Quantity Selector
    quantity: number = 1;
    minQuantity: number = 1;
    maxQuantity: number = 999;

    currentScreenSize: string[] = [];

    isLoading: boolean = false;
    pageOfItems: Array<any>;
    pagination: CartPagination;

    cart: Cart;
    carts: CartWithDetails[];
    
    selectedCart: { 
        carts: { 
            id: string, 
            cartItem: { 
                id: string, 
                selected: boolean
            }[], 
            selected: boolean, 
            minDeliveryCharges?: number, 
            maxDeliveryCharges?: number,
            description: {
                isOpen: boolean,
                value?: string
            },
            deliveryQuotationId: string,
            deliveryType: string
        }[], 
        selected: boolean 
    };
    
    customerId: string = '';
    customerAddress: CustomerAddress;

    paymentDetails: CartDiscount = {
        cartSubTotal: 0,
        subTotalDiscount: 0,
        subTotalDiscountDescription: null,
        discountCalculationType: null,
        discountCalculationValue: 0,
        discountMaxAmount: 0,
        discountType: null,
        storeServiceChargePercentage: 0,
        storeServiceCharge: 0,
        deliveryCharges: 0, // not exist in (cart discount api), fetched from getPrice delivery service
        deliveryDiscount: 0,
        deliveryDiscountDescription: null,
        deliveryDiscountMaxAmount: 0,
        cartGrandTotal: 0,
        voucherDeliveryDiscount: 0,
        voucherDeliveryDiscountDescription: null,
        voucherDiscountCalculationType: null,
        voucherDiscountCalculationValue: 0,
        voucherDiscountMaxAmount: 0,
        voucherDiscountType: null,
        voucherSubTotalDiscount: 0,
        voucherSubTotalDiscountDescription: null,
    }

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        public _dialog: MatDialog,
        private _platformService: PlatformService,
        private _checkoutService: CheckoutService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _currencyPipe: CurrencyPipe,
        private _cartService: CartService,
        private _jwtService: JwtService,
        private _authService: AuthService,
        private _userService: UserService
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

        this._platformService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform) => {
                if(platform) {
                    this.platform = platform;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._cartService.cartsWithDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((cartsWithDetails: CartWithDetails[]) => {

                if (cartsWithDetails) {
                    this.carts = cartsWithDetails;                     
                    
                    let allSelected: boolean[] = [];
                    let allInCartSelected: { id: string; allSelected: boolean[]} = null;
                    if (this.selectedCart) {
                        // set all selected cart to false for every changes
                        this.selectedCart.selected = false;

                        this.carts.forEach(item => {

                            // check if the selectedCart cartId already exists
                            let cartIdIndex = this.selectedCart.carts.findIndex(element => element.id === item.id);
                            
                            if (cartIdIndex > -1) {
                                // set all seleted in cart to false first, later check for true again
                                this.selectedCart.carts[cartIdIndex].selected = false;

                                // get all selected boolean from cartItems
                                allSelected = this.selectedCart.carts[cartIdIndex].cartItem.map(element => element.selected);
                                allInCartSelected = {
                                    id: this.selectedCart.carts[cartIdIndex].id,
                                    allSelected: this.selectedCart.carts[cartIdIndex].cartItem.map(element => element.selected)
                                }
                                // this.selectedCart.carts[cartIdIndex] = {...this.selectedCart.carts[cartIdIndex], ...cart};
                            } else {
                                let cart = {
                                    id: item.id, 
                                    cartItem: item.cartItems.map(element => {
                                        return {
                                            id: element.id,
                                            selected: false
                                        }
                                    }),
                                    selected: false,
                                    description: {
                                        isOpen: false
                                    },
                                    deliveryQuotationId: null,
                                    deliveryType: null
                                };
                                this.selectedCart.carts.push(cart);
                            }

                            // get delivery charges of every carts
                            this.getDeliveryCharges(item.id,item.storeId);
                            

                            if (cartIdIndex > -1 && allInCartSelected !== null && !allInCartSelected.allSelected.includes(false)) {
                                this.selectedCart.carts[cartIdIndex].selected = true;
                            }
                        });
                        
                        if (allSelected.length && !allSelected.includes(false)) {
                            // set all selected cart to true since all items in cartItem is true
                            this.selectedCart.selected = true;                            
                        }
                    } else {
                        this.selectedCart = {
                            carts:  this.carts.map(item => {
                                return {
                                    id: item.id,
                                    cartItem: item.cartItems.map(element => {
                                        return {
                                            id: element.id,
                                            selected: false
                                        }
                                    }),
                                    selected: false,
                                    description: {
                                        isOpen: false
                                    },
                                    deliveryQuotationId: null,
                                    deliveryType: null
                                }
                            }),
                            selected: false
                        }
                    }

                    this._userService.customerAddress$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((customerAddress : CustomerAddress) => {
                            if (customerAddress) {                                
                                this.customerAddress = customerAddress;

                                this.carts.forEach(item => {                        
                                    // get delivery charges of every carts
                                    this.getDeliveryCharges(item.id,item.storeId);
                                });
                            }
                            // Mark for check 
                            this._changeDetectorRef.markForCheck();
                        });                    

                    // this.selectCart(null,null,true);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the cart pagination
        this._cartService.cartsWithDetailsPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: CartPagination) => {
                if (pagination) {
                    // Update the pagination
                    this.pagination = pagination;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            }); 

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {
                this.currentScreenSize = matchingAliases;
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
                        return this._cartService.getCartsWithDetails({page: 0, pageSize: 4, customerId: this.customerId, includeEmptyCart: false});
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public method
    // -----------------------------------------------------------------------------------------------------

    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.pageOfItems = pageOfItems;
        
        if(this.pagination && this.pageOfItems['currentPage']){

            if (this.pageOfItems['currentPage'] - 1 !== this.pagination.page) {
                // set loading to true
                this.isLoading = true;
                this._cartService.getCartsWithDetails({ page: this.pageOfItems['currentPage'] - 1, pageSize: this.pageOfItems['pageSize'], customerId: this.customerId, includeEmptyCart: false})
                    .subscribe((response)=>{
                            
                        // set loading to false
                        this.isLoading = false;
                    });
                    
            }
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();

    }

    displayStoreLogo(store: Store) {
        // let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (store.storeLogoUrl != null) {
            return store.storeLogoUrl;
        } else {
            return this.platform.logo;
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

    checkQuantity(cartId: string, cartItem: CartItem, quantity: number = null, operator: string = null) {
        quantity = quantity ? quantity : cartItem.quantity;
        if (operator === 'decrement')
            quantity > this.minQuantity ? quantity -- : quantity = this.minQuantity;
        else if (operator === 'increment')
            quantity < this.maxQuantity ? quantity ++ : quantity = this.maxQuantity;
        else {
            if (quantity < this.minQuantity) 
                quantity = this.minQuantity;
            else if (quantity > this.maxQuantity)
                quantity = this.maxQuantity;
        }

        let cartIndex = this.carts.findIndex(item => item.id === cartId);
        let cartItemIndex = this.carts[cartIndex].cartItems.findIndex(item => item.id === cartItem.id);
        
        const cartItemBody = {
            cartId: cartItem.cartId,
            id: cartItem.id,
            itemCode: cartItem.itemCode,
            productId: cartItem.productId,
            quantity: quantity
        }

        if (!((cartItem.quantity === quantity) && (quantity === this.minQuantity || quantity === this.maxQuantity))) {
            this._cartService.putCartItem(cartId, cartItemBody, cartItem.id)
                .subscribe((response)=>{
                    this.carts[cartIndex].cartItems[cartItemIndex].quantity = quantity;
                });
        }
    }

    getCartItemsTotal(cartItems: CartItem[]) : number {
        let cartItemsTotal: number;
        if (cartItems.length && cartItems.length > 0) {
            return cartItems.reduce((partialSum, item) => partialSum + item.price, 0);
        } else {
            return cartItemsTotal;
        }
    }

    selectCart(carts: CartWithDetails[], cart: CartWithDetails, cartItem: CartItem, checked: boolean) {
        if (carts) {
            // select all carts
            let cartsIds = carts.map(item => item.id);
            this.selectedCart.carts.forEach(item => {
                item.selected = checked;
                if (cartsIds.includes(item.id)) {
                    item.cartItem.forEach(element => {
                        element.selected = checked;
                    });
                }
            });
        } else if (cart && cartItem === null) {
            // select all cartItems in a cart 
            let cartIndex = this.selectedCart.carts.findIndex(item => item.id === cart.id);
            if (cartIndex > -1) {
                this.selectedCart.carts[cartIndex].cartItem.forEach(item => {
                    item.selected = checked;
                });
            }
            // check for select all cartItems in a cart
            this.carts.forEach(item => {
                if (this.selectedCart.carts.map(element => element.id).includes(item.id)){
                    this.selectedCart.selected = this.selectedCart.carts.every(element => element.selected);
                }
            });
        } else if (cart && cartItem) {
            // select single cart items
            let cartIndex = this.selectedCart.carts.findIndex(item => item.id === cart.id);
            if (cartIndex > -1) {
                this.selectedCart.carts[cartIndex].selected = this.selectedCart.carts[cartIndex].cartItem.every(item => item.selected);
            }
            // check for select all cartItems in a cart
            this.carts.forEach(item => {
                if (this.selectedCart.carts.map(element => element.id).includes(item.id)){
                    this.selectedCart.selected = this.selectedCart.carts.every(element => element.selected);
                }
            });
        } else {
            console.warn("Action not configured");
        }

        let cartItemIds: string[];
        this.selectedCart.carts.forEach((item, iteration) => {
            if (iteration === 0) {
                cartItemIds = item.cartItem.map(element => {
                    if (element.selected === true) {
                        return element.id;
                    }
                });
            } else {
                cartItemIds.concat(item.cartItem.map(element => {
                    if (element.selected === true) {
                        return element.id;
                    }
                }));
            }
        });

        // to list out the array of slectedCart
        let cartListBody = this.selectedCart.carts.map(item => {
            return {
                cartId: item.id,
                selectedItemId: item.cartItem.map(element => {
                    if (element.selected === true) {
                        return element.id
                    }
                // to remove if selected = false (undefined array of cart item)
                }).filter(x => x),
                deliveryQuotationId : item.deliveryQuotationId,
                deliveryType : item.deliveryType
            }
        // to remove if selected = false (undefined array of selectedItemId)
        }).filter(n => {
            if (n.selectedItemId && n.selectedItemId.length > 0) {
                return n;
            }
        });

        // console.log('cartListBody',cartListBody);

        this._cartService.getDiscountOfCartGroup(cartListBody)
        .subscribe((response) => {            
            this.paymentDetails.cartSubTotal = response.sumCartSubTotal === null ? 0 : response.sumCartSubTotal
            this.paymentDetails.deliveryCharges = response.sumCartDeliveryCharge === null ? 0 : response.sumCartDeliveryCharge
            this.paymentDetails.cartGrandTotal = response.sumCartGrandTotal === null ? 0 : response.sumCartGrandTotal
        });

        // console.log("cartItemIds", cartItemIds);
        // console.log("selected", this.selectedCart);

    }

    deleteCartItem(cartId: string, cartItem: CartWithDetails){

        //To make custom pop up, and we pass the details in paramter data
        let dialogRef = this._dialog.open(ModalConfirmationDeleteItemComponent, { disableClose: true, data:{ cartId: cartId, itemId:cartItem.id }});
        dialogRef.afterClosed().subscribe((result) => {            
            
            // // if cart has items, calculate the charges
            // if (this.cartItems.length > 0) {
                
            //     this.calculateCharges()                
            // }
            // // if cart is empty, reset the values
            // else {
            //     // change button to Calculate Charges
            //     this.addressFormChanges();
            // }
        });
    }

    getDeliveryCharges(cartId: string, storeId: string)
    {
        // if customerId null means guest
        let _customerId = this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid ? this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid : null

        const deliveryChargesBody = {
            cartId: cartId,
            customerId: _customerId,
            delivery: {
                deliveryAddress     : this.customerAddress.address,
                deliveryCity        : this.customerAddress.city,
                deliveryState       : this.customerAddress.state,
                deliveryPostcode    : this.customerAddress.postCode,
                deliveryCountry     : this.customerAddress.country,
                deliveryContactEmail: this.customerAddress.email,
                deliveryContactName : this.customerAddress.name,
                deliveryContactPhone: this.customerAddress.phoneNumber,
                latitude            : null,
                longitude           : null
            },
            deliveryProviderId      : null,
            storeId: storeId
        }

        this._checkoutService.postToRetrieveDeliveryCharges(deliveryChargesBody)
            .subscribe((deliveryProviderResponse: DeliveryProvider[])=>{
                let cartIndex = this.selectedCart.carts.findIndex(item => item.id == cartId);
                if (cartIndex > -1) {
                    let minDeliveryCharges = Math.min(...deliveryProviderResponse.map(item => item.price));
                    let maxDeliveryCharges = Math.max(...deliveryProviderResponse.map(item => item.price));
                    
                    this.selectedCart.carts[cartIndex].minDeliveryCharges = minDeliveryCharges;
                    this.selectedCart.carts[cartIndex].maxDeliveryCharges = maxDeliveryCharges;

                    // find index at response to find the minimum price charges
                    let minDeliveryChargesIndex = deliveryProviderResponse.findIndex(item => item.price === minDeliveryCharges);

                    this.selectedCart.carts[cartIndex].deliveryQuotationId = deliveryProviderResponse[minDeliveryChargesIndex].refId;
                    this.selectedCart.carts[cartIndex].deliveryType = deliveryProviderResponse[minDeliveryChargesIndex].deliveryType;
                }                
            });
    }

    getDeliveryChargesRange(index: number) : string 
    {
        
        if (this.selectedCart.carts[index].minDeliveryCharges === this.selectedCart.carts[index].maxDeliveryCharges) {
            return this._currencyPipe.transform(this.selectedCart.carts[index].minDeliveryCharges, this.platform.currency);
        } else {
            return this._currencyPipe.transform(this.selectedCart.carts[index].minDeliveryCharges, this.platform.currency) + " - " + this._currencyPipe.transform(this.selectedCart.carts[index].maxDeliveryCharges, this.platform.currency);
        }
    }

    /**
     * Open the search
     * Used in 'bar'
     */
    open(id: string): void
    {
        let index = this.selectedCart.carts.findIndex(item => item.id === id);

        if(index > -1){
            this.selectedCart.carts[index].description.isOpen = true;
        }
    }

    close(id: string): void
    {
        let index = this.selectedCart.carts.findIndex(item => item.id === id);

        if(index > -1){
            this.selectedCart.carts[index].description.isOpen = false;
        }

    }
}
