import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { PlatformService } from 'app/core/platform/platform.service';
import { JwtService } from 'app/core/jwt/jwt.service';
import { AuthService } from 'app/core/auth/auth.service';
import { HttpStatService } from 'app/mock-api/httpstat/httpstat.service';
import { AdsService } from 'app/core/ads/ads.service';
import { CartService } from 'app/core/cart/cart.service';
import { UserService } from 'app/core/user/user.service';


@Injectable({
    providedIn: 'root'
})
export class LandingDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _adsService: AdsService,
        private _cartsService: CartService,
        private _jwtService: JwtService,
        private _authService: AuthService,
        private _platformsService: PlatformService,
        private _httpstatService: HttpStatService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Use this resolver to resolve initial mock-api for the application
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {        
        let customerId = this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid ? this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid : null

        // Fork join multiple API endpoint calls to wait all of them to finish
        return forkJoin([
            this._adsService.set(),
            this._cartsService.getCartsHeaderWithDetails(0, 99, null, customerId)

        ]);
    }
}

@Injectable({
    providedIn: 'root'
})
export class CustomerAddressResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _userService: UserService,
        private _jwt: JwtService,
        private _authService: AuthService,
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
        // Fork join multiple API endpoint calls to wait all of them to finish
        return this._userService.getCustomerAddress(this._jwt.getJwtPayload(this._authService.jwtAccessToken).uid);
    }
}