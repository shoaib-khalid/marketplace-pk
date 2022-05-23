import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { AppConfig } from 'app/config/service.config';
import { CartService } from 'app/core/cart/cart.service';
import { CustomerAuthenticate } from '../auth.types';

@Injectable({
    providedIn: 'root'
})
export class NoAuthGuard implements CanActivate, CanActivateChild, CanLoad
{
    customerAuthenticate: CustomerAuthenticate;
    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _authService: AuthService,
        private _apiServer: AppConfig,
        private _router: Router,
        private _cartsService: CartService,
        // private _changeDetectorRef: ChangeDetectorRef,
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
        const guestCartId = route ? route.queryParamMap.get('guestCartId') : null
        const storeId = route ? route.queryParamMap.get('storeId') : null
                
        // Check the authentication status
        return this._authService.check()
        .pipe(
            switchMap((authenticated) => {

                // If the user is authenticated...
                if ( authenticated )
                {
                    this._authService.customerAuthenticate$
                        .subscribe((response: CustomerAuthenticate) => {

                            this.customerAuthenticate = response;

                            // MERGE CART
                            if (guestCartId && storeId) {  
                            
                                this._cartsService.mergeAndRedirect(guestCartId, storeId, this.customerAuthenticate.session.ownerId, redirectUrl);
                            
                            } 
                            else {
                                // Redirect to the root
                                this._router.navigate(['/orders']);
                            }
                        });
                    

                    // Prevent the access
                    return of(false);

                }
                // Allow the access
                return of(true);
            })
        );
    }
}
