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
        console.log("navigator.userAgent", navigator.userAgent);

        // Subscribe to platform data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                if (platform) {
                    this.platform = platform;
                    
                    let googleAnalyticId = null;
    
                    // set title
                    this._titleService.setTitle(this.platform.name + " - Marketplace");
     
                    // set GA code
                    googleAnalyticId = this.platform.gacode;
                    this.favIcon16.href = this.platform.favicon16;
                    this.favIcon32.href = this.platform.favicon32;

                    // Set Google Analytic Code
                    if (googleAnalyticId) {

                        // Remove this later
                        // load google tag manager script
                        // const script = document.createElement('script');
                        // script.type = 'text/javascript';
                        // script.async = true;
                        // script.src = 'https://www.google-analytics.com/analytics.js';
                        // document.head.appendChild(script);   
                        
                        // register google tag manager
                        const script2 = document.createElement('script');
                        script2.async = true;
                        script2.src = 'https://www.googletagmanager.com/gtag/js?id=' + googleAnalyticId;
                        document.head.appendChild(script2);

                        // load custom GA script
                        const gaScript = document.createElement('script');
                        gaScript.innerHTML = `
                        window.dataLayer = window.dataLayer || [];
                        function gtag() { dataLayer.push(arguments); }
                        gtag('js', new Date());
                        gtag('config', '${googleAnalyticId}');
                        `;
                        document.head.appendChild(gaScript);

                        // GA for all pages
                        this._router.events.subscribe(event => {
                            if(event instanceof NavigationEnd){
                                // register google analytics            
                                gtag('config', googleAnalyticId, {'page_path': event.urlAfterRedirects});
                                
                            }
                        });
                    }

                    // -----------------------
                    // Create meta description for product
                    // -----------------------

                    this._meta.addTags(
                        [
                            { property: 'og:title', content: "Welcome to " + this.platform.name + " Marketplace" },
                            { property: 'og:description', content: "Order your food, beverages and daily essentials from our local heroes" },
                            { property: 'og:image', content: this.platform.logo }
                        ] as MetaDefinition[], true);
                }
            });

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
