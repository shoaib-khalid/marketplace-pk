import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { Platform } from 'app/core/platform/platform.types';
import { Subject, takeUntil } from 'rxjs';
import { PlatformService } from 'app/core/platform/platform.service';
import { DOCUMENT } from '@angular/common';
import { IpAddressService } from './core/ip-address/ip-address.service';
import { AnalyticService } from './core/analytic/analytic.service';
import { JwtService } from './core/jwt/jwt.service';
import { AuthService } from './core/auth/auth.service';
import { AppConfig } from './config/service.config';
import { CartService } from './core/cart/cart.service';

declare let gtag: Function;

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{
    platform: Platform;
    ipAddress  : string; 

    favIcon16: HTMLLinkElement = document.querySelector('#appIcon16');
    favIcon32: HTMLLinkElement = document.querySelector('#appIcon32');

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _titleService: Title,
        private _router: Router,
        private _platformsService: PlatformService,
        private _activatedRoute: ActivatedRoute,
        private _meta: Meta,
        private _ipAddressService: IpAddressService,
        private _analyticService: AnalyticService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _jwtService: JwtService,
        private _authService: AuthService,
        private _apiServer: AppConfig,
        private _cartService: CartService,
    )
    {
    }

    ngOnInit() {
        
        console.log("navigator",navigator.userAgent);

        // Get User IP Address
        this._ipAddressService.ipAdressInfo$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response:any)=>{
                if (response) {
                    this.ipAddress = response.ip_addr;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._router.events.forEach((event) => {                
            
            // if customerId null means guest
            let _customerId = this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid ? this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid : null
            
            //get domain
            var domain = this._apiServer.settings.marketplaceDomain;
            //get ip address info
            var _IpActivity = this.ipAddress;
            
            //get session id by get cart id
            var _sessionId = this._cartService.cartId$ 

            const activityBody = 
            {
                browserType : null,
                customerId  : _customerId,
                deviceModel : null,
                errorOccur  : null,
                errorType   : null,
                ip          : _IpActivity,
                os          : null,
                pageVisited : 'https://' + domain + event["urlAfterRedirects"],
                sessionId   : _sessionId,
                storeId     : null
            }

            if(event instanceof RoutesRecognized) {
                this._analyticService.postActivity(activityBody).subscribe((response) => {
                });           
            }
            // NavigationEnd
            // NavigationCancel
            // NavigationError
            // RoutesRecognized            
        });
    }
}
