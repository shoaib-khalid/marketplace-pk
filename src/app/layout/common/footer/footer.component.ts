import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from 'environments/environment';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { NavigationEnd, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';

@Component({
    selector       : 'footer',
    templateUrl    : './footer.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'footer'
})
export class FooterComponent implements OnInit
{

    platform: Platform;
    store: Store;
    marketplaceInfo: { phonenumber: string; email: string; address: string };
    landingPage: boolean = true;
    paymentLogos: string[] = [];
    
    public version: string = environment.appVersion;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    providerLogos: string[] = [];

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _platformService: PlatformService,
        private _storesService: StoresService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef
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
        this._platformService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                if (platform) {
                    this.platform = platform;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.marketplaceInfo = {
            email: "hello@deliverin.my",
            phonenumber: "+60125033299",
            address: "First Subang, Unit S-14-06, Level 14, Jalan SS15/4G, 47500 Subang Jaya, Selangor"
        };

        this.paymentLogos = [
            'assets/images/logo/payments/tng-ewallet.png',
            'assets/images/logo/payments/grabpay.png',
            'assets/images/logo/payments/fpx.png',
            'assets/images/logo/payments/visa-mastercard.png',
            'assets/images/logo/payments/boost.png'
        ]

        this.providerLogos = [
            'https://symplified.it/delivery-assets/provider-logo/borzo.png',
            'https://symplified.it/delivery-assets/provider-logo/jnt.png',
            'https://symplified.it/delivery-assets/provider-logo/lalamove.png',
            'https://symplified.it/delivery-assets/provider-logo/pickupp.png',
            // 'https://symplified.it/delivery-assets/provider-logo/tcs.png'
        ]
                
        if ( this._router.url === '/' ) {
            this.landingPage = true;
        }
        else this.landingPage = false;
        

        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
        ).subscribe((response: NavigationEnd) => {
            
            if (!response.url.includes("/store/")) {
                this.store = null;
            }

            if (response.url === '/') {
                this.landingPage = true;
                
            } else this.landingPage = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this._storesService.store$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: Store) => {

                this.store = response;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
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

    goToUrl(){
        const phonenumber = this.marketplaceInfo.phonenumber.replace(/[^0-9]/g, '');
        const message = encodeURI('Tell me more about joining Deliverin platform!')
        this._document.location.href = "https://wa.me/" + phonenumber + '?text=' + message;
    }

    navigate(type: string) {
        this._router.navigate(['/docs/legal/' + type]);
    }
    
}
