import { ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { Platform } from 'app/core/platform/platform.types';
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
import { Loader } from '@googlemaps/js-api-loader';

declare let gtag: Function;

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{
    platform    : Platform;
    ipAddress   : string; 
    userSession : UserSession;

    favIcon16: HTMLLinkElement = document.querySelector('#appIcon16');
    favIcon32: HTMLLinkElement = document.querySelector('#appIcon32');

    //get current location
    currentLat  : any = 0;
    currentLong : any = 0;

    // lat : any = 3.081600
    // lng: any = 101.585430

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _titleService: Title,
        private _router: Router,
        private _platformsService: PlatformService,
        private _ipAddressService: IpAddressService,
        private _apiServer: AppConfig,
        private _analyticService: AnalyticService,
        private _changeDetectorRef: ChangeDetectorRef,
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
    
                    // set title
                    this._titleService.setTitle("Welcome to " + this.platform.name + " Marketplace");
     
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
                }
                // Mark for Check
                this._changeDetectorRef.markForCheck();
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

        // implement google maos
        let loader = new Loader({
            apiKey: 'AIzaSyCFhf1LxbPWNQSDmxpfQlx69agW-I-xBIw',
            libraries: ['places']
            
        })
        loader.load().then(() => {
            // This is making the Geocode request
            var geocoder;
            geocoder = new google.maps.Geocoder();
            var latlng = new google.maps.LatLng(this.currentLat, this.currentLong);
    
            geocoder.geocode({ 'latLng': latlng },  (results, status) =>{
                // if (status !== google.maps.GeocoderStatus.OK ) {
                //     alert(status);
                // }
                // This is checking to see if the Geoeode Status is OK before proceeding
                if (status === google.maps.GeocoderStatus.OK && results) {

                    //to implement get current location first to be display if in db is null
                    navigator.geolocation.getCurrentPosition((position) => {
                        let crd = position.coords;
                        this.currentLat = crd.latitude;
                        this.currentLong = crd.longitude;

                    });
                    // console.log(results);
                    var address = (results[0].address_components);
                    
                    // Find Postcode
                    let postcodeIndex = address.findIndex(item => item.types.includes("postal_code"))
                    var postcode = address[postcodeIndex] ? address[postcodeIndex].long_name : ''

                    // Find city
                    let cityIndex = address.findIndex(item => item.types.includes("locality"))
                    var city = address[cityIndex] ? address[cityIndex].long_name : ''

                    // Find state
                    let stateIndex = address.findIndex(item => item.types.includes("administrative_area_level_1"))
                    var state = address[stateIndex] ? address[stateIndex].long_name : ''

                    // Find country
                    let countryIndex = address.findIndex(item => item.types.includes("country"))
                    var country = address[countryIndex] ? address[countryIndex].long_name : ''

                    // Find Address 
                    let subpremiseIndex = address.findIndex(item => item.types.includes("subpremise"))
                    let subpremise = address[subpremiseIndex] ? address[subpremiseIndex].long_name : ''

                    let premiseIndex = address.findIndex(item => item.types.includes("premise"))
                    let premise = address[premiseIndex] ? address[premiseIndex].long_name : ' '

                    let routeIndex = address.findIndex(item => item.types.includes("route"))
                    let route = address[routeIndex] ? address[routeIndex].long_name : ' '

                    let sublocal_1Index = address.findIndex(item => item.types.includes("sublocality_level_1"))
                    let sublocal_1 = address[sublocal_1Index] ? address[sublocal_1Index].long_name : ' '

                    let sublocal_2Index = address.findIndex(item => item.types.includes("sublocality_level_2"))
                    let sublocal_2 = address[sublocal_2Index] ? address[sublocal_2Index].long_name : ''

                    // let sublocalityIndex = address.findIndex(item => item.types.includes("sublocality"))
                    // let sublocality = address[sublocalityIndex] ? address[sublocalityIndex].long_name : ' '

                    var customerAddress = subpremise + premise + route + ' ' + sublocal_1 + sublocal_2 
                    console.log("customerAddress", customerAddress);
                    
                    // Check for router changes
                    this._router.events.forEach(
                        (event) => {               
                            
                            // get domain
                            let domain = this._apiServer.settings.marketplaceDomain;

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
                                longitude   : null,
                                address     : customerAddress,
                                postcode    : ''? null : postcode,
                                city        : ''? null : city,
                                state       : ''? null : state,
                                country     : ''? null : country
                            }

                            if(event instanceof RoutesRecognized) {
                                this._analyticService.postActivity(activityBody).subscribe((response) => {
                                });           
                            }         
                        }
                    );
                    this._changeDetectorRef.markForCheck();
                }
                if (status !== google.maps.GeocoderStatus.OK) {
                    this._router.events.forEach(
                    (event) => {               
                        
                        // get domain
                        let domain = this._apiServer.settings.marketplaceDomain;

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
                            longitude   : null,
                            address     : null,
                            postcode    : null,
                            city        : null,
                            state       : null, 
                            country     : null,
                        }

                        if(event instanceof RoutesRecognized) {
                            this._analyticService.postActivity(activityBody).subscribe((response) => {
                            });           
                        }         
                    }
                );
                }
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();
            
        });

        // // Check for router changes
        // this._router.events.forEach(
        //     (event) => {               
                
        //         // get domain
        //         let domain = this._apiServer.settings.marketplaceDomain;

        //         const activityBody = 
        //         {
        //             browserType : this.userSession ? this.userSession.browser : null,
        //             deviceModel : this.userSession ? this.userSession.device : null,
        //             ip          : this.userSession ? this.userSession.ip : null,
        //             os          : this.userSession ? this.userSession.os : null,
        //             sessionId   : this.userSession ? this.userSession.id : null,
        //             storeId     : null,
        //             customerId  : null,
        //             errorOccur  : null,
        //             errorType   : null,
        //             pageVisited : 'https://' + domain + event["urlAfterRedirects"]
        //         }

        //         if(event instanceof RoutesRecognized) {
        //             this._analyticService.postActivity(activityBody).subscribe((response) => {
        //             });           
        //         }         
        //     }
        // );
    }
}
