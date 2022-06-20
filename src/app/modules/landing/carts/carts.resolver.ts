import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { JwtService } from 'app/core/jwt/jwt.service';
import { forkJoin, Observable, throwError } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class CartsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _cartsService: CartService,
        private _jwtService: JwtService,
        private _authService: AuthService

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        let customerId = this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid ? this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid : null

        return forkJoin([
            // this._cartsService.getCarts(0, 4, null, customerId),
            this._cartsService.getCartsWithDetails(0, 2, null, customerId)
        ]);
    }
}