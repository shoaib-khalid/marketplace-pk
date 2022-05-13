import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StoreCategory, Store, StorePagination } from 'app/core/store/store.types';
import { StoresService } from 'app/core/store/store.service';

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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):  Observable<any>
    {
        return forkJoin([
            this._storesService.getStores("",0,10,"MYS","created","desc"),
            this._storesService.getFeaturedStore("",0,6,"MYS","created","desc")
        ]);
        
    }
}
