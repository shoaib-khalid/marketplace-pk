import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { PlatformService } from 'app/core/platform/platform.service';
import { JwtService } from 'app/core/jwt/jwt.service';
import { AuthService } from 'app/core/auth/auth.service';
import { HttpStatService } from 'app/mock-api/httpstat/httpstat.service';
import { AdsService } from 'app/core/ads/ads.service';

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
        // Fork join multiple API endpoint calls to wait all of them to finish
        return this._adsService.set();
    }
}