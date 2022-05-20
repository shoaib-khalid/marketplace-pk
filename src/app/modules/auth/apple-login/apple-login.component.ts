import { ChangeDetectorRef, Component, Inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { JwtService } from 'app/core/jwt/jwt.service';
import { PlatformService } from 'app/core/platform/platform.service';
import { map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Platform } from 'app/core/platform/platform.types';
import { AuthService } from 'app/core/auth/auth.service';
import { ValidateOauthRequest } from 'app/core/auth/auth.types';
import { AppConfig } from 'app/config/service.config';
import { DOCUMENT } from '@angular/common';
import { AppleLoginService } from './apple-login.service';
import { CartService } from 'app/core/cart/cart.service';
import { Cart } from 'app/core/cart/cart.types';



@Component({
    selector     : 'apple-login',
    template  : ``,
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AppleLoginComponent
{
    idToken:string;
    jwtData:string;
    clientEmail:string;

    platform: Platform;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    domain :string ='';
    cart: Cart;


    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,
        private _activatedRoute: ActivatedRoute,
        private _jwtService: JwtService,
        private _authService: AuthService,
        private _router: Router,
        private _platformsService: PlatformService,
        private _apiServer: AppConfig,
        private _appleLoginService: AppleLoginService,
        private _cartsService: CartService,

    )
    {
      
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
     ngOnInit(): void
     {  
        this._activatedRoute.queryParams.subscribe(params => {
            this.idToken = params['id_token'];
            this.jwtData = this._jwtService.getJwtPayload(this.idToken);
            this.clientEmail = this.jwtData['email'];

            this.domain = this._apiServer.settings.storeFrontDomain;

            this._platformsService.platform$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((platform: Platform) => {

                    this.platform = platform;    

                    if (this.platform) {

                        let validateOauthRequest: ValidateOauthRequest = new ValidateOauthRequest();
                        validateOauthRequest.country = this.platform.country;
                        validateOauthRequest.loginType = "APPLE";
                        validateOauthRequest.token = this.idToken;
                        validateOauthRequest.email = this.clientEmail;
                        validateOauthRequest.domain = this.domain;
    
                        this._authService.loginOauth(validateOauthRequest, "Apple Login")
                            .subscribe((loginOauthResponse)=> {

                                // store front domain, to be used to compare with redirectURL
                                const storeFrontDomain = this._apiServer.settings.storeFrontDomain;
                                
                                if (this._appleLoginService.sfUrl$ && this._appleLoginService.guestCartId$ && this._appleLoginService.storeId$ ) {  
            
                                    const sfUrl = this._appleLoginService.sfUrl$;
                                    const guestCartId = this._appleLoginService.guestCartId$;
                                    const storeId = this._appleLoginService.storeId$;
                                                            
                                    if (sfUrl.includes(storeFrontDomain)) {
            
                                        this._cartsService.getCarts(0, 20, storeId, loginOauthResponse['session'].ownerId)
                                            .subscribe(response => {

                                                if (response['data'].content.length > 0) {
                                                    
                                                    this.cart = response['data'].content[0];
            
                                                    if (guestCartId != this.cart.id) {
                                                        // merge carts
                                                        this._cartsService.mergeCart(this.cart.id, guestCartId)
                                                            .subscribe(response => {
                                                                // remove 'sf-url' from localStorage
                                                                localStorage.removeItem('sf-url');
                                                                // Navigate to the external redirect url
                                                                this._document.location.href = sfUrl;
                                                            })
                                                    } else {
                                                        this._document.location.href = sfUrl;
                                                    }
                                                }
                                                // if no existing cart for the store
                                                else {
                                                    this._document.location.href = sfUrl;
                                                }
                                            })
                                        
                                    } else {

                                        localStorage.removeItem('sf-url');
                                        // Navigate to the internal redirect url
                                        this._router.navigateByUrl('/signed-in-redirect');
                                    }
                                    
                                }
                                else 
                                {
                                    this._router.navigateByUrl('/signed-in-redirect');
                                }
                            });
                    }

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
          });
     } 
}
