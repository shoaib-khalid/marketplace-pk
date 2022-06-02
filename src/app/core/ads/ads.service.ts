import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { AppConfig } from 'app/config/service.config';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { Ad } from './ads.types';

@Injectable({
    providedIn: 'root'
})
export class AdsService
{
    private _ad: ReplaySubject<Ad> = new ReplaySubject<Ad>(1);
    private _ads: ReplaySubject<Ad[]> = new ReplaySubject<Ad[]>(1);

    /**
     * Constructor
     */
    constructor(
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
    set ad(value: Ad)
    {
        // Store the value
        this._ad.next(value);
    }

    get ad$(): Observable<Ad>
    {
        return this._ad.asObservable();
    }

    /**
     * Setter & getter for ads
     *
     * @param value
     */
     set ads(value: Ad[])
     {
         // Store the value
         this._ads.next(value);
     }

    get ads$(): Observable<Ad[]>
    {
        return this._ads.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
    * Set current platform
    */
    set(): Observable<any>
    {
        return of(true).pipe(
            switchMap(async (response: any) => {

                this._logging.debug("Response from AdsService (Set)", response);

                const ads = {
                    bannerUrl: "assets/images/example/join_now.png",
                    redirectUrl: "https://" + this._apiServer.settings.merchantPortalDomain + "/sign-up"
                };
                this._ads.next([ads]);

                return [ads];
            })
        );
    }

}
