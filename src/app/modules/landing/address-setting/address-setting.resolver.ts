import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { UserService } from "app/core/user/user.service";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CustomerAddressResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _userService: UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Use this resolver to resolve initial mock-api for the application
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._userService.getCustomerAddresses();
    }
}