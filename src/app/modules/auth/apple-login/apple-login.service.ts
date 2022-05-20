import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AppleLoginService
{

    /**
     * Constructor
     */
    constructor(
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter for cartId
     */
    set sfUrl(value: string) {
        localStorage.setItem('sf-url', value);
    }

    /**
     * Getter for cartId
     */
    get sfUrl$(): string
    {
        return localStorage.getItem('sf-url') ?? '';
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

}
