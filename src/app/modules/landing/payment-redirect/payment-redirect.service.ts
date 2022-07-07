import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class PaymentRedirectService
{
    // private _cart: ReplaySubject<Cart> = new ReplaySubject<Cart>(1);
    // private _cartItems: ReplaySubject<CartItem[]> = new ReplaySubject<CartItem[]>(1);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService,
        private _apiServer: AppConfig,
        private _jwt: JwtService,
        private _logging: LogService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the Order Info
     */
    getOrderById(id: string): Observable<any>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`)
        };

        return this._httpClient.get<any>(orderService + '/orders/' + id, header)
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap(async (response: any) => {
                    this._logging.debug("Response from StoresService (getOrderById)",response);

                    return response["data"];
                })
            );
    }

    getOrderGroupsById(id: string): Observable<any>
    {
        let orderService = this._apiServer.settings.apiServer.orderService;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`)
        };

        return this._httpClient.get<any>(orderService + '/ordergroups/' + id, header).pipe(
            catchError(() =>
                // Return false
                of(false)
            ),
            switchMap(async (response: any) => {
                this._logging.debug("Response from StoresService (getOrderGroupsById)",response);

                return response["data"];
            })
        );
    }
}
