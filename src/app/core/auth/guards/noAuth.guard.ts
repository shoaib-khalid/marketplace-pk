import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { switchMap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { AppConfig } from 'app/config/service.config';

@Injectable({
    providedIn: 'root'
})
export class NoAuthGuard implements CanActivate, CanActivateChild, CanLoad
{
    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _authService: AuthService,
        private _apiServer: AppConfig,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Can activate
     *
     * @param route
     * @param state
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean
    {        
        return this._check(route);
    }

    /**
     * Can activate child
     *
     * @param childRoute
     * @param state
     */
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        return this._check(null);
    }

    /**
     * Can load
     *
     * @param route
     * @param segments
     */
    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean
    {
        return this._check(null);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check the authenticated status
     *
     * @private
     */
    private _check(route?: ActivatedRouteSnapshot): Observable<boolean>
    {
        
        const redirectUrl = route ? route.queryParamMap.get('redirectURL') : null
        
        // store front domain, to be used to compare with redirectURL
        const storeFrontDomain = this._apiServer.settings.storeFrontDomain;
        console.log(storeFrontDomain);
        
        // Check the authentication status
        return this._authService.check()
        .pipe(
            switchMap((authenticated) => {

                // If the user is authenticated...
                if ( authenticated )
                {
                    // If it has redirectUrl, redirect it to external url
                    if (redirectUrl) {
                        if (redirectUrl.includes(storeFrontDomain)) {
                            // Navigate to the external redirect url
                            this._document.location.href = redirectUrl;
                        }
                    }
                    
                    // Redirect to the root
                    this._router.navigate(['/orders']);

                    // Prevent the access
                    return of(false);
                }

                // Allow the access
                return of(true);
            })
        );
    }
}
