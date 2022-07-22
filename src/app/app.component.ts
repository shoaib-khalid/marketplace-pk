import { ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { Platform, PlatformTag } from 'app/core/platform/platform.types';
import { Subject, takeUntil } from 'rxjs';
import { PlatformService } from 'app/core/platform/platform.service';
import { IpAddressService } from './core/ip-address/ip-address.service';
import { AnalyticService } from './core/analytic/analytic.service';
import { JwtService } from './core/jwt/jwt.service';
import { AuthService } from './core/auth/auth.service';
import { AppConfig } from './config/service.config';
import { SwUpdate } from '@angular/service-worker';
import { UserService } from './core/user/user.service';
import { UserSession } from './core/user/user.types';

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
    userSession : UserSession;

    favIcon16: HTMLLinkElement = document.querySelector('#appIcon16');
    favIcon32: HTMLLinkElement = document.querySelector('#appIcon32');

    metaDescription: HTMLMetaElement = document.querySelector('meta[name="description"]');
    metaKeyword: HTMLMetaElement = document.querySelector('meta[name="keywords"]');
    h1Title: HTMLLinkElement = document.querySelector('#body-title');

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _titleService: Title,
        private _router: Router,
        private _platformsService: PlatformService,
        private _ipAddressService: IpAddressService,
        private _analyticService: AnalyticService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _jwtService: JwtService,
        private _authService: AuthService,
        private _apiServer: AppConfig,
        private _userService: UserService,
        private _swUpdate: SwUpdate
    )
    {
        // reload if there are any update for PWA
        _swUpdate.available.subscribe(event => {
            _swUpdate.activateUpdate().then(()=>document.location.reload());
        });
    }

    ngOnInit() {
        
        console.log("navigator",navigator.userAgent);

        // Subscribe to platform data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                if (platform) {
                    this.platform = platform;
                    
                    let googleAnalyticId = null;

                    this._platformsService.getTag(platform.id)
                    .subscribe((tags: PlatformTag[]) => {
                        if (tags) {

                            let descIndex = tags.findIndex(tag => tag.property === 'og:description');
                            let keywordsIndex = tags.findIndex(tag => tag.name === 'keywords');
                            let h1Index = tags.findIndex(tag => tag.property === 'og:title');

                            if (descIndex > -1) {
                                this.metaDescription.content = tags[descIndex].content;
                            }
                            if (keywordsIndex > -1) {
                                this.metaKeyword.content = tags[keywordsIndex].content;
                            }
                            if (h1Index > -1) {
                                this.h1Title.innerText = tags[h1Index].content;
                            }
                        }
                    })

                    // set title
                    this._titleService.setTitle("Welcome to " + this.platform.name + " Marketplace");
     
                    // set GA code
                    googleAnalyticId = this.platform.gacode;
                    this.favIcon16.href = this.platform.favicon16 + '?original=true';
                    this.favIcon32.href = this.platform.favicon32 + '?original=true';

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
                }
            });

        this._userService.userSession$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((userSession: UserSession)=>{
            if (userSession) {
                this.userSession = userSession;
            }
            // Mark for Check
            this._changeDetectorRef.markForCheck();
        });

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
            var _sessionId = null // this._cartService.cartId$ 

            const activityBody = 
            {
                browserType : this.userSession ? this.userSession.browser : null,
                deviceModel : this.userSession ? this.userSession.device : null,
                ip          : this.userSession ? this.userSession.ip : null,
                os          : this.userSession ? this.userSession.os : null,
                sessionId   : this.userSession ? this.userSession.id : null,
                storeId     : null,
                customerId  : null,
                errorOccur  : null,
                errorType   : null,
                pageVisited : 'https://' + domain + event["urlAfterRedirects"],
                latitude    : null,
                longitude   : null
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
