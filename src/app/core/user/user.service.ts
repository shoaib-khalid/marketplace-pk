import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Client, Customer, CustomerAddress, HttpResponse, HttpResponsePagination, User } from 'app/core/user/user.types';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private _customer: BehaviorSubject<Customer | null> = new BehaviorSubject(null);
    private _client: BehaviorSubject<Client | null> = new BehaviorSubject(null);

    private _customerAddress: BehaviorSubject<CustomerAddress | null> = new BehaviorSubject(null);
    private _customersAddress: BehaviorSubject<CustomerAddress[] | null> = new BehaviorSubject(null);


    
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _authService: AuthService,
        private _jwt: JwtService,
        private _logging: LogService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User)
    {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

        /**
     * Setter & getter for user
     *
     * @param value
     */
        set customer(value: Customer)
        {
            // Store the value
            this._customer.next(value);
        }
    
        get customer$(): Observable<Customer>
        {
            return this._customer.asObservable();
        }

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set client(value: Client)
    {
        // Store the value
        this._client.next(value);
    }

    get client$(): Observable<Client>
    {
        return this._client.asObservable();
    }


    get customersAddress$(): Observable<CustomerAddress[]>
    {
        return this._customersAddress.asObservable();
    }

    get customerAddress$(): Observable<CustomerAddress>
    {
        return this._customerAddress.asObservable();
    }


    get customerId()
    {
        return this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;
    }
         

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(ownerId: string): Observable<any>
    {
        let userService = this._apiServer.settings.apiServer.userService;
        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };

        return this._httpClient.get<any>(userService + "/customers/" + ownerId, header)
            .pipe(
                tap((user) => {
                    this._logging.debug("Response from UserService (getCustomerById)",user);
                    this._user.next(user);
                })
            );
    }

    putCustomerById(payloadBody){
        let userService = this._apiServer.settings.apiServer.userService;

        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };

        return this._httpClient.put<HttpResponse<Customer>>(userService + "/customers/" + this.customerId, payloadBody, header)
            .pipe(
                tap((update:HttpResponse<Customer>) => {
                    this._logging.debug("Response from UserService (putCustomerById)",update);
                }
            )
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        return this._httpClient.patch<User>('api/common/user', {user}).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }

    /**
     * ========================================
     *Customer Address Controller
     ===========================================
     */
    getCustomerAddress(){
        let userService = this._apiServer.settings.apiServer.userService;

        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };

        return this._httpClient.get<HttpResponsePagination<CustomerAddress[]>>(userService + "/customer/" + this.customerId +'/address', header)
            .pipe(
                tap((address:HttpResponsePagination<CustomerAddress[]>) => {
                    this._logging.debug("Response from UserService (getCustomerAddress)",address);
                    this._customersAddress.next(address.data.content);

                }
            )
        );
    }

    getCustomerAddressById(id:string){
        let userService = this._apiServer.settings.apiServer.userService;

        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };

        return this._httpClient.get<HttpResponse<CustomerAddress>>(userService + "/customer/" + this.customerId +'/address'+ id, header)
            .pipe(
                tap((address:HttpResponse<CustomerAddress>) => {
                    this._logging.debug("Response from UserService (getCustomerAddressById)",address);
                    this._customerAddress.next(address.data);

                }
            )
        );
    }

    createCustomerAddress(body: CustomerAddress): Observable<CustomerAddress>
    {
        let userService = this._apiServer.settings.apiServer.userService;

        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };

        return this.customersAddress$.pipe(
            take(1),
            // switchMap(address => this._httpClient.post<InventoryDiscount>('api/apps/ecommerce/inventory/discount', {}).pipe(
            switchMap(address => this._httpClient.post<CustomerAddress>(userService + "/customer/" + this.customerId +'/address',body, header).pipe(
                map((newAddress) => {

                    this._logging.debug("Response from addressService (createAddress)",newAddress);


                    //If newly data is set to default address
                    if(newAddress["data"].isDefault === true){
                        const findDefaultTrue = address.find(item => item.isDefault === true);
                        const indexDefaultTrue = address.findIndex(item => item.isDefault === true);
                        findDefaultTrue.isDefault =false;
                        address[indexDefaultTrue] = { ...address[indexDefaultTrue], ...findDefaultTrue};
                    }

                    // Update the address with the new discount
                    this._customersAddress.next([newAddress["data"], ...address]);

                    // Return the new discount
                    return newAddress;
                })
            ))
        );
    }

    
    putCustomerAddressById(customerAddressBody:CustomerAddress){
        let userService = this._apiServer.settings.apiServer.userService;

        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };

        return this.customersAddress$.pipe(
            take(1),
            switchMap(address => this._httpClient.put<HttpResponse<CustomerAddress>>(userService + "/customer/" + this.customerId +'/address/'+ customerAddressBody.id, customerAddressBody, header).pipe(
                map((updatedAddress) => {

                    this._logging.debug("Response from addressService (putCustomerAddressById)", updatedAddress);

                    // Find the index of the updated address
                    const index = address.findIndex(item => item.id === customerAddressBody.id);

                    const isCurrentDataDefault = address.find(item => item.isDefault === true && item.id === customerAddressBody.id);

                    //if the newly data is isDefault === true we need to chnage the existing one that to false
                    if(!isCurrentDataDefault){
                        if(updatedAddress.data.isDefault === true){

                            const findDefaultTrue = address.find(item => item.isDefault === true);
                            const indexDefaultTrue = address.findIndex(item => item.isDefault === true);
                            findDefaultTrue.isDefault =false;
                            address[indexDefaultTrue] = { ...address[indexDefaultTrue], ...findDefaultTrue};
                        }
                    }

                    // Update the address
                    address[index] = { ...address[index], ...updatedAddress.data};

                    this._customersAddress.next(address); 
            
                    // Return the updated address
                    return updatedAddress["data"];
                }),
                switchMap(updatedAddress => this.customerAddress$.pipe(
                    take(1),
                    filter(item => item && item.id === customerAddressBody.id),
                    tap(() => {

                        // Update the address if it's selected
                        this._customerAddress.next(updatedAddress["data"]);

                        // Return the updated address
                        return updatedAddress["data"];
                    })
                ))
            ))
        );
    }

    setDefaultCustomerAddressById(customerAddressBody:CustomerAddress){
        let userService = this._apiServer.settings.apiServer.userService;

        customerAddressBody.isDefault = true;

        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };

        return this.customersAddress$.pipe(
            take(1),
            switchMap(address => this._httpClient.put<HttpResponse<CustomerAddress>>(userService + "/customer/" + this.customerId +'/address/'+ customerAddressBody.id, customerAddressBody, header).pipe(
                map((updatedAddress) => {

                    this._logging.debug("Response from addressService (setDefaultCustomerAddressById)", updatedAddress);


                    // Find the index of the updated address
                    const index = address.findIndex(item => item.id === customerAddressBody.id);

                    const isSetDefault = address.find(item => item.isDefault === true && item.id === customerAddressBody.id);

                    //if current set to default === true we need to chnage the existing one that to false
                    if(isSetDefault){
                            const findExistDefaultTrue = address.find(item => item.isDefault === true && item.id !== customerAddressBody.id);
                            const indexDefaultTrue = address.findIndex(item => item.isDefault === true && item.id !== customerAddressBody.id);
                            findExistDefaultTrue.isDefault =false;
                            address[indexDefaultTrue] = { ...address[indexDefaultTrue], ...findExistDefaultTrue};
                    }

                    // Update the address
                    address[index] = { ...address[index], ...updatedAddress.data};

                    this._customersAddress.next(address); 
            
                    // Return the updated address
                    return updatedAddress["data"];
                }),
                switchMap(updatedAddress => this.customerAddress$.pipe(
                    take(1),
                    filter(item => item && item.id === customerAddressBody.id),
                    tap(() => {

                        // Update the address if it's selected
                        this._customerAddress.next(updatedAddress["data"]);

                        // Return the updated address
                        return updatedAddress["data"];
                    })
                ))
            ))
        );
    }

    deleteCustomerAddressById(customerAddressId:string){
        let userService = this._apiServer.settings.apiServer.userService;

        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };

        return this.customersAddress$.pipe(
            take(1),
            switchMap(address => this._httpClient.delete<HttpResponse<CustomerAddress>>(userService + "/customer/" + this.customerId +'/address/'+ customerAddressId, header).pipe(
                map((status:any) => {

                    // Find the index of the deleted address
                    const index = address.findIndex(item => item.id === customerAddressId);

                    // Delete the address
                    address.splice(index, 1);

                    // Update the address
                    this._customersAddress.next(address);

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

    changePasswordCustomerById(changePwdPayload)
    {

        let userService = this._apiServer.settings.apiServer.userService;

        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };

   
        return this.client$.pipe(
            take(1),
            switchMap(client => this._httpClient.put<any>(userService + '/customers/' + this.customerId + '/changepassword', changePwdPayload , header).pipe(
                map((response) => {

                    this._logging.debug("Response from StoresService (chnagePasswordCustomerById)",response);

                    // Return the new product
                    return response["data"];
                })  
            )) 
        );
    }
}
