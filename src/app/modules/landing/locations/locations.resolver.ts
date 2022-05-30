import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { forkJoin, Observable, throwError } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class LocationResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _locationService: LocationService

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

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        console.log('LocationResolver');
        
        // Fork join multiple API endpoint calls to wait all of them to finish
        return forkJoin([
            this._locationService.getLocations(0, 20, 'cityId', 'asc')
        ])
    }
}