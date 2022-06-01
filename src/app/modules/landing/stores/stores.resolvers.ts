import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { StoreCategory, Store, StorePagination } from 'app/core/store/store.types';
import { StoresService } from 'app/core/store/store.service';
import { LocationService } from 'app/core/location/location.service';
import { PlatformService } from 'app/core/platform/platform.service';

@Injectable({
    providedIn: 'root'
})
export class StoresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _router: Router, 
        private _storesService: StoresService,
        private _locationService: LocationService,
        private _platformsService: PlatformService,

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
    * Resolver
    *
    * @param route
    * @param state
    */
    // resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):  Observable<any>
    // {
    //     console.log('StoresResolver');
        
    //     return forkJoin([
    //         this._storesService.getStores("",0,10,"MYS","created","desc"),
    //         this._locationService.getFeaturedStores(0, 20, response.platformCountry,"created","desc").subscribe(()=>{});
    //     ]);
        
    // }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {

        // this._platformsService.platform$
        // .pipe(takeUntil(this._unsubscribeAll))
        // .subscribe((platform: Platform) => { 

        //     this.platform = platform;  

        //     this._locationService.getFeaturedStores(0, this.mobileView ? 5 : 10, platform.country)
        //     .subscribe((stores) => {
        //         console.log(stores);
                
        //         this.featuredStores = stores;  
                
        //     })  
    
        //     this._changeDetectorRef.markForCheck();

        // });

        return forkJoin([
            this._platformsService.platform$
            .pipe(
                take(1),
                switchMap((response) => {   
                    console.log('response StoresResolver', response);
                         
                    // this._storesService.getStores("",0,10,response.platformCountry,"created","desc").subscribe(()=>{});
                    this._locationService.getFeaturedStores({pageSize:20, regionCountryId:response.country}).subscribe(()=>{});
                    return of(true);
                })
            ),
            // this._locationService.getFeaturedStores(0, 20, response.platformCountry,"created","desc").subscribe(()=>{});
        ]);
    }
}
