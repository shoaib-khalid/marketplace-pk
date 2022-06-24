import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { Cart, CartItem, CartPagination, CartWithDetails, CustomerCart, DiscountOfCartGroup } from 'app/core/cart/cart.types';
import { AppConfig } from 'app/config/service.config';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from '../auth/auth.service';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class CartService
{
    private _cart: ReplaySubject<Cart> = new ReplaySubject<Cart>(1);
    private _carts: ReplaySubject<Cart[]> = new ReplaySubject<Cart[]>(1);
    private _cartItems: ReplaySubject<CartItem[]> = new ReplaySubject<CartItem[]>(1);

    private _cartWithDetails: ReplaySubject<CartWithDetails> = new ReplaySubject<CartWithDetails>(1);
    private _cartsWithDetails: ReplaySubject<CartWithDetails[]> = new ReplaySubject<CartWithDetails[]>(1);
    private _cartsWithDetailsPagination: ReplaySubject<CartPagination> = new ReplaySubject<CartPagination>(1);

    private _cartsHeaderWithDetails: ReplaySubject<CartWithDetails[]> = new ReplaySubject<CartWithDetails[]>(1);
    private _cartsHeaderWithDetailsPagination: ReplaySubject<CartPagination> = new ReplaySubject<CartPagination>(1);

    private _customerCarts: ReplaySubject<CustomerCart> = new ReplaySubject<CustomerCart>(1);
    private _cartPagination: BehaviorSubject<CartPagination | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _authService: AuthService,
        private _router: Router,
        private _logging: LogService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for cart
     *
     * @param value
     */
    set cart(value: Cart)
    {
        // Store the value
        this._cart.next(value);
    }

    get cart$(): Observable<Cart>
    {
        return this._cart.asObservable();
    }

    get carts$(): Observable<Cart[]>
    {
        return this._carts.asObservable();
    }

    get cartWithDetails$(): Observable<CartWithDetails>
    {
        return this._cartWithDetails.asObservable();
    }

    get cartsWithDetails$(): Observable<CartWithDetails[]>
    {
        return this._cartsWithDetails.asObservable();
    }

    get cartsHeaderWithDetails$(): Observable<CartWithDetails[]>
    {
        return this._cartsHeaderWithDetails.asObservable();
    }

    /**
    * Getter for cart pagination
    */
    get cartsWithDetailsPagination$(): Observable<CartPagination>
    {
        return this._cartsWithDetailsPagination.asObservable();
    }

    /**
    * Getter for cart pagination
    */
    get cartsHeaderWithDetailsPagination$(): Observable<CartPagination>
    {
        return this._cartsHeaderWithDetailsPagination.asObservable();
    }

    /**
     * Setter & getter for cartItem
     *
     * @param value
     */
    set cartItems(value: CartItem[])
    {
        // Store the value
        this._cartItems.next(value);
    }

    get cartItems$(): Observable<CartItem[]>
    {
        return this._cartItems.asObservable();
    }

    /**
     * Setter for cartId
     */
    set cartId(value: string) {
        localStorage.setItem('cartId', value);
    }

    /**
     * Getter for cartId
     */
    get cartId$(): string
    {
        return localStorage.getItem('cartId') ?? '';
    }

    /**
     * Getter for customerCarts
     */
    get customerCarts$(): Observable<CustomerCart>
    {
        return this._customerCarts.asObservable();
    }

    /**
    * Getter for cart pagination
    */
    get cartPagination$(): Observable<CartPagination>
    {
        return this._cartPagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    // -------------
    // Cart
    // -------------

    /**
     * Get the current logged in cart data
     */
    getCarts(page: number = 0, size: number = 10, storeId: string = null, customerId: string = null):
        Observable<{ pagination: CartPagination; carts: Cart[] }>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                page        : '' + page,
                pageSize    : '' + size,
                storeId     : '' + storeId,
                customerId  : '' + customerId
            }
        };

        if (storeId === null) delete header.params.storeId;

        return this._httpClient.get<any>(orderService +'/carts', header).pipe(
            tap((response) => {

                this._logging.debug("Response from CartService (getCarts)",response);

                let _pagination = {
                    length: response.data.totalElements,
                    size: response.data.size,
                    page: response.data.number,
                    lastPage: response.data.totalPages,
                    startIndex: response.data.pageable.offset,
                    endIndex: response.data.pageable.offset + response.data.numberOfElements - 1
                }
                this._cartPagination.next(_pagination);
                this._carts.next(response.data.content);
            })
        );
    }

    /**
     * Get the current logged in cart data
     */
    getCartsWithDetails(page: number = 0, size: number = 10, storeId: string = null, customerId: string = null):
    Observable<{ pagination: CartPagination; carts: Cart[] }>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                page        : '' + page,
                pageSize    : '' + size,
                storeId     : '' + storeId,
                customerId  : '' + customerId,
                includeEmptyCart: false
            }
        };

        if (storeId === null) delete header.params.storeId;

        return this._httpClient.get<any>(orderService +'/carts/details', header).pipe(
            tap((response) => {

                this._logging.debug("Response from CartService (getCartsHeaderWithDetails)",response);

                let _pagination = {
                    length: response.data.totalElements,
                    size: response.data.size,
                    page: response.data.number,
                    lastPage: response.data.totalPages,
                    startIndex: response.data.pageable.offset,
                    endIndex: response.data.pageable.offset + response.data.numberOfElements - 1
                }
                this._cartsWithDetailsPagination.next(_pagination);
                this._cartsWithDetails.next(response.data.content);
            })
        );
    }

    /**
     * Get the current logged in cart data
     */
    getCartsHeaderWithDetails(page: number = 0, size: number = 10, storeId: string = null, customerId: string = null):
    Observable<{ pagination: CartPagination; carts: Cart[] }>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                page        : '' + page,
                pageSize    : '' + size,
                storeId     : '' + storeId,
                customerId  : '' + customerId,
                includeEmptyCart: false
            }
        };

        if (storeId === null) delete header.params.storeId;

        return this._httpClient.get<any>(orderService +'/carts/details', header).pipe(
            tap((response) => {

                this._logging.debug("Response from CartService (getCartsWithDetails)",response);

                let _pagination = {
                    length: response.data.totalElements,
                    size: response.data.size,
                    page: response.data.number,
                    lastPage: response.data.totalPages,
                    startIndex: response.data.pageable.offset,
                    endIndex: response.data.pageable.offset + response.data.numberOfElements - 1
                }
                this._cartsHeaderWithDetailsPagination.next(_pagination);
                this._cartsHeaderWithDetails.next(response.data.content);
            })
        );
    }

    /**
     * (Used by app.resolver)
     * 
     * @param customerId 
     * @returns 
     */
    getCartsByCustomerId(customerId: string): Observable<CustomerCart>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`),
            params: {
                customerId
            }
        };

        return this._httpClient.get<any>(orderService + '/carts/customer', header)
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap(async (response: any) => {
                                
                    this._logging.debug("Response from CartService (getCartsByCustomerId)", response);
                
                    // set customer cart
                    this._customerCarts.next(response["data"]);

                    return response["data"];
                })
            );
    }
    
    /**
     * Create the cart
     *
     * @param cart
     */
    createCart(cart: Cart): Observable<any>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.post<any>(orderService + '/carts', cart, header)
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap(async (response: any) => {
                    this._logging.debug("Response from StoresService (createCart)",response);

                    // set cart id
                    this.cartId = response["data"].id;

                    // set cart
                    this._cart.next(response);

                    return response["data"];
                })
            );
    }

    /**
     * Update the cart
     *
     * @param cart
     */
    updateCart(cart: Cart): Observable<any>
    {
        return this._httpClient.patch<Cart>('api/common/cart', {cart}).pipe(
            map((response) => {
                this._cart.next(response);
            })
        );
    }

    /**
     * Delete cart
     * 
     * @param cartId 
     * @param itemId 
     * @returns 
     */
    deleteCart(cartId: string): Observable<Cart>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this.carts$.pipe(
            take(1),
            switchMap(carts => this._httpClient.delete<any>(orderService + '/carts/' + cartId, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from CartService (deleteCart)", response);

                    let index = carts.findIndex(item => item.id === cartId);

                    if (index > -1) {
                        // Delete the cartItems
                        carts.splice(index, 1);

                        // Update the products
                        this._carts.next(carts);
                    }

                    return response["data"];
                })
            ))
        );
    }

    mergeCart(customerCartId : string, guestCartId : string):  Observable<Cart>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.put<any>(orderService + '/carts/' + customerCartId + '/' + guestCartId, header)
            .pipe(
                take(1),
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap(async (response: any) => {
                                
                    this._logging.debug("Response from CartService (mergeCart)", response);
                
                    return response;
                })
            );

    }

    // -------------
    // Cart Items
    // -------------

    /**
     * Get the current logged in cart data
     */
    getCartItems(id: string): Observable<Cart>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.get<any>(orderService + '/carts/' + id + '/items', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (getCartItems)",response);

                    // set cart id
                    this._cartItems.next(response["data"].content);

                    return response["data"].content;
                })
            );
    }

    postCartItem(cartId: string, cartItem: CartItem):  Observable<CartItem>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this.cartItems$.pipe(
            take(1),
            switchMap(cartItems => this._httpClient.post<any>(orderService + '/carts/' + cartId + '/items', cartItem, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (postCartItem)",response);

                    let index = cartItems.findIndex(item => item.id === response["data"].id);

                    if (index > -1) {
                        // update if existing cart item id exists
                        cartItems[index] = { ...cartItems[index], ...response["data"]};
                        this._cartItems.next(cartItems);
                    } else {
                        // add new if cart item not exist yet in cart
                        this._cartItems.next([response["data"], ...cartItems]);
                    }

                    return response["data"];
                })
            ))
        );
    }

    putCartItem(cartId: string, cartItem: CartItem, itemId: string):  Observable<CartItem>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };
        

        return this.cartsWithDetails$.pipe(
            take(1),
            switchMap(cartsWithDetails => this._httpClient.put<any>(orderService + '/carts/' + cartId + '/items/' + itemId, cartItem, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (postCartItem)",response);

                    let cartIndex = cartsWithDetails.findIndex(item => item.id === response["data"].cartId);
                    let cartItemIndex = cartIndex > -1 ? cartsWithDetails[cartIndex].cartItems.findIndex(item => item.id === response["data"].id) : -1;

                    if (cartItemIndex > -1) { 

                        let _cart = cartsWithDetails[cartIndex];
                        _cart.cartItems[cartItemIndex] = response["data"];

                        // update if existing cart item id exists
                        cartsWithDetails[cartIndex] = { ...cartsWithDetails[cartIndex], ..._cart};
                        this._cartsWithDetails.next(cartsWithDetails);
                    } 

                    return response["data"];
                })
            ))
        );
    }

    deleteCartItem(cartId: string, itemId: string):  Observable<CartItem>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        console.log("this.cartsWithDetails$", this.cartsWithDetails$);
        

        return this.cartsWithDetails$.pipe(
            take(1),
            switchMap(cartsWithDetails => this._httpClient.delete<any>(orderService + '/carts/' + cartId + '/items/' + itemId, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from CartService (deleteCartItem)",response);

                    let index = cartsWithDetails.findIndex(item => item.id === itemId);

                    if (index > -1) {
                        // Delete the cartItems
                        cartsWithDetails.splice(index, 1);

                        // Update the products
                        this._cartsWithDetails.next(cartsWithDetails);

                        console.log("_cartsWithDetails",this._cartsWithDetails);
                        console.log("cartsWithDetails", cartsWithDetails);
                        
                        
                    }

                    return response["data"];
                })
            ))
        );
    }

    /**
     * Merge carts and redirect
     * 
     * @param guestCartId 
     * @param storeId 
     * @param ownerId 
     * @param redirectURL 
     */
    mergeAndRedirect(guestCartId: string, storeId: string, ownerId: string, redirectURL: string = null): void 
    {
        if (guestCartId && storeId) {  

            this.getCarts(0, 20, storeId, ownerId)
                .subscribe(cartResponse => {

                    if (cartResponse['data'].content.length > 0) {
                        
                        let cart = cartResponse['data'].content[0];

                        if (guestCartId != cart.id) {
                            // merge carts
                            this.mergeCart(cart.id, guestCartId)
                                .subscribe(mergeResponse => {
                                    this.redirect(redirectURL);
                                })
                        }
                        // guest cartId and existing cartId is the same
                        else {
                            this.redirect(redirectURL);
                        }
                    }
                    // if no existing cart for the store, then create one, then merge it
                    else {
                        const createCartBody = {
                            customerId: ownerId, 
                            storeId: storeId,
                        }
                        this.createCart(createCartBody)
                            .subscribe((cart: Cart)=>{
                                // set cart id
                                let cartId = cart.id;
                                // merge carts
                                this.mergeCart(cartId, guestCartId)
                                .subscribe(mergeResponse => {
                                    this.redirect(redirectURL);
                                })
                            });
                    }
                })
        } 
        // if no guestCartId/storeId
        else {
            this.redirect(redirectURL);
        }    

    }

    /**
     * Redirect to external/internal URL
     * 
     * @param redirectURL 
     */
    redirect(redirectURL?: string) {

        // store front domain, to be used to compare with redirectURL
        const storeFrontDomain = this._apiServer.settings.storeFrontDomain;
        // const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL')
        
        if (redirectURL) {  
            
            if (redirectURL.includes(storeFrontDomain)) {
                // Navigate to the external redirect url
                this._document.location.href = redirectURL;
            } else {
                // Navigate to the internal redirect url
                this._router.navigateByUrl(redirectURL);
            }
        }
        else 
        {
            this._router.navigateByUrl('/signed-in-redirect');
        }
    }

    //-----------------------
    //      Cart Group
    //-----------------------

    getDiscountOfCartGroup(CartListBody: any): Observable<DiscountOfCartGroup> 
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.post<any>(orderService + '/carts' + '/groupdiscount', CartListBody, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (getDiscountOfCartGroup)",response);

                    // Return the new notification from observable
                    return response['data'];
                })
        );
    }

}
