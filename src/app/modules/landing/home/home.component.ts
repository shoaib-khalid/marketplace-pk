import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { LocationService } from 'app/core/location/location.service';
import { ParentCategory, LandingLocation, StoresDetails, ProductDetails } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StorePagination } from 'app/core/store/store.types';
import { AppConfig } from 'app/config/service.config';
import { map, merge, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent implements OnInit
{
    @ViewChild("storesPaginator", {read: MatPaginator}) private _storesPaginator: MatPaginator;
    @ViewChild("productsPaginator", {read: MatPaginator}) private _productsPaginator: MatPaginator;

    platform: Platform;

    locations: LandingLocation[] = [];
    locationsViewAll : boolean = false;

    categories: ParentCategory[] = [];
    categoriesViewAll : boolean = false;

    featuredStores: StoresDetails[] = [];
    featuredStoresPagination: StorePagination;
    featuredStoresPageOfItems: Array<any>;
    storesViewAll : boolean = false;

    featuredProducts: ProductDetails[] = [];
    featuredProductsPagination: StorePagination;
    featuredProductsPageOfItems: Array<any>;
    productsViewAll : boolean = false;

    isLoading: boolean = false;

    banners: any;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _locationService: LocationService,
        private _apiServer: AppConfig
    )
    {
    }

    ngOnInit(): void {
        // Get Platform Data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                if (platform) {
                    this.platform = platform;  
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get all locations
        this._locationService.featuredLocations$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((locations) => {
                if (locations) {
                    this.locations = locations;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get featured stores
        this._locationService.featuredStores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores) => {
                if (stores) {
                    this.featuredStores = stores;  
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get featured stores pagination
        this._locationService.featuredStorePagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((storesPagination) => {
                if (storesPagination) {
                    this.storesViewAll = (storesPagination.length > storesPagination.size) ? true : false;
                    this.featuredStoresPagination = storesPagination;  
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get all parentCategories
        this._locationService.parentCategories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: ParentCategory[]) => {
                if (categories) {
                    // to show only 8
                    this.categories = (categories.length >= 8) ? categories.slice(0, 8) : categories;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            let orderService = this._apiServer.settings.apiServer.orderService;

        // hardcode banner
        this.banners = [
            {
                bannerUrl: "assets/images/example/join_now.png",
                redirectUrl: "https://" + this._apiServer.settings.merchantPortalDomain + "/sign-up"
            }
        ];
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

    /**
    * After view init
    */
    ngAfterViewInit(): void
    {
        setTimeout(() => {
            if (this._storesPaginator )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._storesPaginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._locationService.getFeaturedStores({ page: this.featuredStoresPageOfItems['currentPage'] - 1, pageSize: this.featuredStoresPageOfItems['pageSize'], regionCountryId: this.platform.country});
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
            if (this._productsPaginator )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._productsPaginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._locationService.getFeaturedProducts({ page: this.featuredProductsPageOfItems['currentPage'] - 1, pageSize: this.featuredProductsPageOfItems['pageSize'], regionCountryId: this.platform.country});
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);
    }
 
    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.featuredStoresPageOfItems = pageOfItems;
        if( this.featuredStoresPagination && this.featuredStoresPageOfItems['currentPage']) {
            if (this.featuredStoresPageOfItems['currentPage'] - 1 !== this.featuredStoresPagination.page) {
                // set loading to true
                this.isLoading = true;
    
                this._locationService.getFeaturedStores({ page: this.featuredStoresPageOfItems['currentPage'] - 1, pageSize: this.featuredStoresPageOfItems['pageSize'], regionCountryId: this.platform.country})
                    .subscribe(()=>{
                        // set loading to false
                        this.isLoading = false;
                    });
            }
        }

        // update current page of items
        this.featuredProductsPageOfItems = pageOfItems;
        if( this.featuredProductsPagination && this.featuredProductsPageOfItems['currentPage']) {
            if (this.featuredProductsPageOfItems['currentPage'] - 1 !== this.featuredProductsPagination.page) {
                // set loading to true
                this.isLoading = true;
    
                this._locationService.getFeaturedProducts({ page: this.featuredProductsPageOfItems['currentPage'] - 1, pageSize: this.featuredProductsPageOfItems['pageSize'], regionCountryId: this.platform.country})
                    .subscribe(()=>{
                        // set loading to false
                        this.isLoading = false;
                    });
            }
        }
        
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    scrollToTop(el) {
        var to = 0;
        var duration = 1000;
        var start = el.scrollTop,
            change = to - start,
            currentTime = 0,
            increment = 20;
    
        var easeInOutQuad = function(t, b, c, d) {
            t /= d / 2;
            if (t < 1) 
                return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
    
        var animateScroll = function() {        
            currentTime += increment;
            var val = easeInOutQuad(currentTime, start, change, duration);
    
            el.scrollTop = val;
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
                el.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start' });
            }
        }
        animateScroll();    
    }
}
