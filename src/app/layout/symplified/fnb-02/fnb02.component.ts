import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Platform } from 'app/core/platform/platform.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { fuseAnimations } from '@fuse/animations';
import { Error500Service } from 'app/core/error-500/error-500.service';
import { DOCUMENT, PlatformLocation } from '@angular/common';
import { FloatingBannerService } from 'app/core/floating-banner/floating-banner.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { AppConfig } from 'app/config/service.config';

@Component({
    selector     : 'fnb02-layout',
    templateUrl  : './fnb02.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations

})
export class Fnb2LayoutComponent implements OnInit, OnDestroy
{
    opened: boolean = false;
    platform: Platform;
    user: User;
    
    isScreenSmall: boolean;
    navigation: Navigation;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    show500: boolean;
    floatingMessageData = {};
    
    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _activatedRoute: ActivatedRoute,
        private _apiServer: AppConfig,
        private _router: Router,
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _platformsService: PlatformService,
        private _error500Service: Error500Service,
        private _userService: UserService,
        private _platformLocation: PlatformLocation,
        private _floatingBannerService: FloatingBannerService,
        
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });

        // Subscribe to platform data
        this._platformsService.platform$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((platform: Platform) => {
            this.platform = platform;
        });

        // Subscribe to platform data
        this._error500Service.show500$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((any) => {
            this.show500 = any;
        });

        // Subscribe to the user service
        this._userService.user$
        .pipe((takeUntil(this._unsubscribeAll)))
        .subscribe((user: User) => {
            this.user = user;
        });

        // Set promo banner
        if (!this.user) {
            let fullUrl = (this._platformLocation as any).location.origin;
            let sanatiseUrl = fullUrl.replace(/^(https?:|)\/\//, '').split(':')[0]; // this will get the domain from the URL
            let redirectUrl = 'https://' + this._apiServer.settings.marketplaceDomain + '/sign-up' +
                    '?redirectURL=' + encodeURI('https://' + sanatiseUrl  + this._router.url) 
                    // + '&guestCartId=' + this._cartService.cartId$ + '&storeId=' + this._storesService.storeId$;

            this._floatingBannerService.setSmallBanner('assets/gif/SignUp_Now_Button_Click_GIF.gif', redirectUrl)
            this._floatingBannerService.setBigBanner('assets/promo/Sign-Up-PopUp-Banner_400x500.png', redirectUrl)
                    }
    
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the search
     * Used in 'bar'
     */
    open(): void
    {
        // Return if it's already opened
        if ( this.opened )
        {
            return;
        }

        // Open the search
        this.opened = true;
    }

    close(): void
    {
        // Return if it's already closed
        if ( !this.opened )
        {
            return;
        }

        // Close the search
        this.opened = false;
    }

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }

    goToHome() {
        this._router.navigate(['/']);

        // Navigate to the internal redirect url (temporary)
        // const redirectURL = this.platform.name === "DeliverIn" ? "https://www.deliverin.my" : "https://www.easydukan.co";
        // this._document.location.href = redirectURL;
    }
    
}
