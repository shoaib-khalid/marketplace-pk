import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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

    
    putCustomerAddressById(customerAddressBody:CustomerAddress){
        let userService = this._apiServer.settings.apiServer.userService;

        const header = {
            headers: new HttpHeaders().set("Authorization", this._authService.publicToken)
        };

        return this._httpClient.put<HttpResponse<CustomerAddress>>(userService + "/customer/" + this.customerId +'/address/'+ customerAddressBody.id, customerAddressBody, header)
            .pipe(
                tap((address:HttpResponse<CustomerAddress>) => {
                    this._logging.debug("Response from UserService (putCustomerAddressById)",address);
                    this._customerAddress.next(address.data);
                }
            )
        );
    }
}
