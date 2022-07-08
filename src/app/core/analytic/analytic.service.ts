import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CustomerActivity } from './analytic.types';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from 'app/core/jwt/jwt.service';
import { LogService } from 'app/core/logging/log.service';
import { AuthService } from '../auth/auth.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { IpAddressService } from '../ip-address/ip-address.service';
import { StoresService } from '../store/store.service';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root'
})
export class AnalyticService
{
    //get current location
    currentLat  : any = 0;
    currentLong : any = 0;

    private _analytic: ReplaySubject<CustomerActivity> = new ReplaySubject<CustomerActivity>(1);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _authService: AuthService,
        private _jwtService: JwtService,
        private _logging: LogService,
        private _deviceService: DeviceDetectorService,
        private _ipAddressService: IpAddressService,
        private _userService: UserService,
        private _storeService: StoresService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for customer activity
     */
    get analytic$(): Observable<CustomerActivity>
    {
        return this._analytic.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    resolveAnalytic(): Observable<any>
    {
        return of(true).pipe(
            map((response)=>{

                //get device info (browser info, os info, device nodel infp)
                let device = this._deviceService.getDeviceInfo();
                let deviceBrowser = device.browser + ' ' + device.browser_version
                let deviceOs = device.os_version
                let deviceModel = device.deviceType + ' ' + device.device

                this._ipAddressService.getIPAddress()
                    .subscribe((ipAddressResponse)=>{
                        const body = {
                            id      : this._userService.userSessionId$ !== '' ? this._userService.userSessionId$ : null,
                            ip      : ipAddressResponse.ip_addr,
                            os      : deviceOs,
                            device  : deviceModel,
                            browser : deviceBrowser,
                            created : new Date().toISOString() + "",
                            updated : new Date().toISOString() + ""
                        }
                        this._userService.generateSession(body).subscribe((generateSessionResponse)=>{
                            this._userService.userSessionId = generateSessionResponse.id;
                        });
                    });
            })
        );
    }

    /**
    * Create the cart
    *
    * @param cart
    */
    postActivity(bodyActivity: CustomerActivity): Observable<any>
    {

        // //to implement get current location first to be display if in db is null
        // navigator.geolocation.getCurrentPosition((position) => {
        //     let crd = position.coords;
        //     this.currentLat = crd.latitude;
        //     this.currentLong = crd.longitude;

        // });

        // get storeId
        let storeId = this._storeService.storeId$;

        // get customerId
        let customerId = this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid ? this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid : null;
        
        bodyActivity["storeId"]     = storeId;
        // bodyActivity["latitude"]    = this.currentLat;
        // bodyActivity["longitude"]   = this.currentLong;
        bodyActivity["customerId"]  = customerId;

        let analyticService = this._apiServer.settings.apiServer.analyticService;

        const header = {  
            headers: new HttpHeaders().set("Authorization", `Bearer ${this._authService.publicToken}`)
        };

        return this._httpClient.post<any>(analyticService + '/customeractivity', bodyActivity, header)
            .pipe(
                map((response) => {
                    this._logging.debug("Response from AnalyticService (postActivity)",response);

                    // set cart
                    this._analytic.next(response);

                    return response["data"];
                })
            );
    }
}