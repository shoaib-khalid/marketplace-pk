import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { finalize, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';
import { DOCUMENT } from '@angular/common';

@Component({
    selector     : 'auth-sign-out',
    templateUrl  : './sign-out.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AuthSignOutComponent implements OnInit, OnDestroy
{
    countdown: number = 3;
    countdownMapping: any = {
        '=1'   : '# second',
        'other': '# seconds'
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    //to be display the text
    titleText:string ='You have signed out!';
    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _authService: AuthService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

            
        
        // Sign out
        this._authService.signOut();
        
        // Redirect after the countdown
        timer(1000, 1000)
            .pipe(
                finalize(() => {
                    
                    let redirectUrl = '';

                    // Navigate to the redirect url
                    this._activatedRoute.queryParams.subscribe(param => {
                            redirectUrl = param['redirectUrl'];     

                            if (redirectUrl) {
                                this._document.location.href = redirectUrl;
                                
                            }
                            else {
                                this._router.navigate(['sign-in']);
                                
                            }
                        })

                }),
                takeWhile(() => this.countdown > 0),
                takeUntil(this._unsubscribeAll),
                tap(() => this.countdown--)
            )
            .subscribe();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
