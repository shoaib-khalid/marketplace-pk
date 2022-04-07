import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { StoresService } from 'app/core/store/store.service';
import { Customer } from 'app/core/user/user.types';
import { Address, CartDiscount, DeliveryCharges, DeliveryProvider } from './checkout.types';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class CheckoutService
{
    private _address: ReplaySubject<Address> = new ReplaySubject<Address>(1);
    private _addresses: ReplaySubject<Address[]> = new ReplaySubject<Address[]>(1);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _storeService: StoresService,
        private _jwt: JwtService,
        private _logging: LogService,
        private _authService: AuthService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter for saveMyInfo
     */
    set saveMyInfo(value: string) {
        localStorage.setItem('saveMyInfo', value);
    }

    /**
     * Getter for cartId
     */
    get saveMyInfo$(): string
    {
        return localStorage.getItem('saveMyInfo') ?? '';
    }

    /**
    * Getter for orders
    */
    get customerAddress$(): Observable<any>
    {
        return this._address.asObservable();
    }

    get customerAddresses$(): Observable<Address[]>
    {
        return this._addresses.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the Customer Info
     */
    getCustomerInfo(email: string = null, phoneNumber: string = null): Observable<Customer>
    {
        let userService = this._apiServer.settings.apiServer.userService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                email,
                phoneNumber
            }
        };

        if (header.params.email === null) delete header.params.email;
        if (header.params.phoneNumber === null) delete header.params.phoneNumber;

        return this._httpClient.get<any>(userService + '/stores/' + this._storeService.storeId$ + '/customers/', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (getCustomerInfo)",response);

                    return response["data"].content[0];
                })
            );
    }

    postToRetrieveDeliveryCharges(deliveryCharges: DeliveryCharges) : Observable<DeliveryProvider[]>
    {
        let deliveryService = this._apiServer.settings.apiServer.deliveryService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.post<any>(deliveryService + '/orders/getprice', deliveryCharges, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (postToRetrieveDeliveryCharges)",response);

                    return response["data"];
                })
            );
    }

    /**
     * Get Discount
     */
    getDiscountOfCart(id: string, deliveryQuotationId: string = null, deliveryType: string): Observable<CartDiscount>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                deliveryQuotationId,
                deliveryType
            }
        };

        if (deliveryQuotationId === null) { delete header.params.deliveryQuotationId; }

        return this._httpClient.get<any>(orderService + '/carts/'+ id +'/discount', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (getDiscountOfCart)",response);

                    return response["data"];
                })
            );
    }

    getSubTotalDiscount(id: string): Observable<CartDiscount>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.get<any>(orderService + '/carts/'+ id +'/subtotaldiscount', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (getSubTotalDiscount)",response);

                    return response["data"];
                })
            );
    }

    postPlaceOrder(cartId: string, orderBody, saveInfo: boolean) : Observable<any>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                cartId,
                saveCustomerInformation: saveInfo
            }
        };

        return this._httpClient.post<any>(orderService + '/orders/placeOrder', orderBody, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (postPlaceOrder)",response);

                    return response["data"];
                })
            );
    }

    postMakePayment(paymentBody) : Observable<any>
    {
        let paymentService = this._apiServer.settings.apiServer.paymentService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.post<any>(paymentService + '/payments/makePayment', paymentBody, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (postMakePayment)",response);

                    return response["data"];
                })
            );
    }

    // -----------------------------------------------------------------------------------------------------
    //                                         Customer Address
    // -----------------------------------------------------------------------------------------------------

    getCustomerAddress (id: string) {
        let userService = this._apiServer.settings.apiServer.userService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.get<any>(userService + '/customer/' + customerId + '/address', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from UserService (getCustomerAddress)",response);

                    this._addresses.next(response["data"].content);
                })
            );
    }
    postCustomerAddress(id: string, customerAddressBody) : Observable<Address>
    {
        let userService = this._apiServer.settings.apiServer.userService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this.customerAddresses$.pipe(
            take(1),
            switchMap( addresses => this._httpClient.post<any>(userService + '/customer/' + customerId + '/address', customerAddressBody, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from CheckoutService (postCustomerAddress)",response);

                    const updatedAddresses = addresses;

                    updatedAddresses.unshift(response["data"]);

                    console.log("updatedAddresses",updatedAddresses);
                    
                    
                    this._addresses.next(updatedAddresses);

                    return response["data"];
                })
            ))
        );
    }

    /**
    * Update address
    *
    * @param id
    * @param address
    */
    updateCustomerAddress(id: string, body: Address): Observable<any>
    {
        let userService = this._apiServer.settings.apiServer.userService;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
        };

        return this.customerAddresses$.pipe(
            take(1),
            // switchMap(discounts => this._httpClient.post<InventoryDiscount>('api/apps/ecommerce/inventory/discount', {}).pipe(
            switchMap(addresses => this._httpClient.put<Address>(userService + '/stores/' + customerId + '/address/' +  id , body , header).pipe(
                map((updatedAddress) => {

                    this._logging.debug("Response from CheckoutService (UpdateAddress)",updatedAddress);

                    // Find the index of the updated discount
                    const index = addresses.findIndex(item => item.id === id);

                    // Update the discount
                    addresses[index] = { ...addresses[index], ...updatedAddress["data"]};

                    // Update the discounts
                    this._addresses.next(addresses);

                    // Return the updated discount
                    return updatedAddress["data"];
                }),
                switchMap(updatedAddress => this.customerAddress$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the discount if it's selected
                        this._address.next(updatedAddress["data"]);

                        // Return the updated discount
                        return updatedAddress["data"];
                    })
                ))
            ))
        );
    }

    deleteCustomerAddress(addressId:string)  : Observable<boolean> {

        let userService = this._apiServer.settings.apiServer.userService;
        let accessToken = this._jwt.getJwtPayload(this._authService.jwtAccessToken).act;
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        console.log('taok');
        

        return this.customerAddresses$.pipe(
            take(1),
            switchMap(addresses => this._httpClient.delete(userService + '/customer/' + customerId + '/address/' + addressId, header)
            .pipe(
                map((status: number) => {

                    this._logging.debug("Response from CheckoutService (deleteCustomerAddress)",status);

                    // Find the index of the deleted discount
                    const index = addresses.findIndex(item => item.id === addressId);

                    // Delete the discount
                    addresses.splice(index, 1);

                    // Update the discounts
                    this._addresses.next(addresses);

                    let isDeleted:boolean = false;
                    if (status === 200) {
                        isDeleted = true
                    }

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }
    
    getCustomerAddressById(addressId:string) : Observable<Address>
    {
        let userService = this._apiServer.settings.apiServer.userService;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;
        
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
   
        };

        let response = this._httpClient.get<Address>(userService + '/customer/' + customerId + '/address/' + addressId, header);
        this._logging.debug("Response from CheckoutService (getAddressById)", response);

        return response;

    }

    getStoreRegionCountryState(regionCountryId: string): Observable<any>
    {
        let productService = this._apiServer.settings.apiServer.productService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                "regionCountryId": regionCountryId
            }
        };

        return this._httpClient.get<any>(productService + '/region-country-state', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from StoresService (getStoreRegionCountryState)",response);
                    return response["data"].content;
                })
            );
    }
    
    // /**
    //  * Create the cart
    //  *
    //  * @param cart
    //  */
    // createCart(cart: Cart): Observable<any>
    // {
    //     let orderService = this._apiServer.settings.apiServer.orderService;
    //     //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
    //     let accessToken = "accessToken";

    //     const header = {  
    //         headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
    //     };

    //     return this._httpClient.post<any>(orderService + '/carts', cart, header)
    //         .pipe(
    //             map((response) => {
    //                 this._logging.debug("Response from StoresService (createCart)",response);

    //                 // set cart id
    //                 this.cartId = response["data"].id;

    //                 // set cart
    //                 this._cart.next(response);

    //                 return response["data"];
    //             })
    //         );
    // }

    // /**
    //  * Update the cart
    //  *
    //  * @param cart
    //  */
    // updateCart(cart: Cart): Observable<any>
    // {
    //     return this._httpClient.patch<Cart>('api/common/cart', {cart}).pipe(
    //         map((response) => {
    //             this._cart.next(response);
    //         })
    //     );
    // }
}
