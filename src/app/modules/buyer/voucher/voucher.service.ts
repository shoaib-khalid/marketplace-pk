import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerVoucher, Voucher } from './voucher.types';

@Injectable({
    providedIn: 'root'
})
export class VoucherService
{
    private _voucher: ReplaySubject<Voucher> = new ReplaySubject<Voucher>(1);
    private _vouchers: ReplaySubject<Voucher[]> = new ReplaySubject<Voucher[]>(1);

    private _customerVoucher: ReplaySubject<CustomerVoucher> = new ReplaySubject<CustomerVoucher>(1);
    private _customerVouchers: ReplaySubject<CustomerVoucher[]> = new ReplaySubject<CustomerVoucher[]>(1);

    private _usedCustomerVoucher: ReplaySubject<CustomerVoucher> = new ReplaySubject<CustomerVoucher>(1);
    private _usedCustomerVouchers: ReplaySubject<CustomerVoucher[]> = new ReplaySubject<CustomerVoucher[]>(1);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
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
    * Getter for voucher
    */
    get voucher$(): Observable<any>
    {
        return this._voucher.asObservable();
    }

    get vouchers$(): Observable<Voucher[]>
    {
        return this._vouchers.asObservable();
    }

    /**
    * Getter for customer voucher
    */
    get customerVoucher$(): Observable<any>
    {
        return this._customerVoucher.asObservable();
    }

    get customerVouchers$(): Observable<CustomerVoucher[]>
    {
        return this._customerVouchers.asObservable();
    }

    /**
    * Getter for used customer voucher
    */
    get usedCustomerVoucher$(): Observable<any>
    {
        return this._usedCustomerVoucher.asObservable();
    }

    get usedCustomerVouchers$(): Observable<CustomerVoucher[]>
    {
        return this._usedCustomerVouchers.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    //                                             Voucher
    // -----------------------------------------------------------------------------------------------------

    getAvailableVoucher () {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this._httpClient.get<any>(orderService + '/voucher/available', header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from OrderService (getAvailableVoucher)",response);

                    return response["data"].content

                    // this._vouchers.next(response["data"].content);
                })
            );
    }

    getAvailableCustomerVoucher (isUsed: boolean) {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params : {
                isUsed
            }
        };

        return this._httpClient.get<any>(orderService + '/voucher/claim/' + customerId, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from OrderService (getAvailableCustomerVoucher) isUsed: " + isUsed ,response);

                    if(isUsed){
                        this._usedCustomerVouchers.next(response["data"].content);
                    } else {
                        this._customerVouchers.next(response["data"].content);
                    }
                    
                    // return response["data"].content
                })
            );
    }

    postCustomerClaimVoucher(id: string, voucherCode: string) : Observable<any>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;
        //let accessToken = this._jwt.getJwtPayload(this.accessToken).act;
        let accessToken = "accessToken";
        let customerId = this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`)
        };

        return this.customerVouchers$.pipe(
            take(1),
            switchMap( customerVouchers => this._httpClient.post<any>(orderService + '/voucher/claim/' + id + '/' + voucherCode, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from VoucherService (postCustomerClaimVoucher)",response);

                    const updatedCustomerVouchers = customerVouchers;

                    updatedCustomerVouchers.unshift(response["data"]);
                    
                    this._customerVouchers.next(updatedCustomerVouchers);

                    return response["data"];
                })
            ))
        );

        // return this._httpClient.post<any>(orderService + '/voucher/claim/' + id + '/' + voucherCode, header)
        //     .pipe(
        //         map((response) => {
        //             this._logging.debug("Response from VoucherService (postCustomerClaimVoucher)",response);

        //             return response["data"];
        //         })
        //     );
    }

}
