import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { LocationService } from 'app/core/location/location.service';
import { ParentCategory, LandingLocation, StoresDetails, ProductDetails } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { ProductPagination, StorePagination } from 'app/core/store/store.types';
import { AppConfig } from 'app/config/service.config';
import { map, merge, Subject, switchMap, takeUntil } from 'rxjs';
import { AdsService } from 'app/core/ads/ads.service';
import { Ad } from 'app/core/ads/ads.types';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { ViewportScroller } from '@angular/common';

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
    featuredStorePageSize = 10;

    featuredProducts: ProductDetails[] = [];
    featuredProductsPagination: ProductPagination;
    featuredProductsPageOfItems: Array<any>;
    productsViewAll : boolean = false;
    featuredProductPageSize = 30;

    isLoading: boolean = false;
    currentScreenSize: string[] = [];
    ads: Ad[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _locationService: LocationService,
        private _adsService: AdsService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _apiServer: AppConfig,
        private _scroller: ViewportScroller
    )
    {
    }

    ngOnInit(): void {

        // Get platform data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                if (platform) {
                    this.platform = platform;

                    // Get categories
                    this._locationService.getParentCategories({pageSize: 50, regionCountryId: this.platform.country })
                        .subscribe((category : ParentCategory[]) => {
                        });

                    // Get locations
                        this._locationService.getFeaturedLocations({pageSize: 50, sortByCol: 'sequence', sortingOrder: 'ASC', regionCountryId: this.platform.country })
                            .subscribe((location : LandingLocation[]) => {
                            });

                    // Get featured stores
                    this._locationService.getFeaturedStores({pageSize: this.featuredStorePageSize, sortByCol: 'sequence', sortingOrder: 'ASC', regionCountryId: this.platform.country })
                        .subscribe((stores : StoresDetails[]) => {
                        });

                    // Get featured products
                    this._locationService.getFeaturedProducts({pageSize: this.featuredProductPageSize, sortByCol: 'sequence', sortingOrder: 'ASC', regionCountryId: this.platform.country })
                        .subscribe((products : ProductDetails[]) => {
                        });
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

        // Get all locations
        this._locationService.featuredLocationPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) => {
                if (pagination) {
                    this.locationsViewAll = (pagination.length > pagination.size) ? true : false;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get featured products
        this._locationService.featuredProducts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products) => {
                if (products) {
                    this.featuredProducts = products;  
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get featured product pagination
        this._locationService.featuredProductPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((productsPagination) => {
                if (productsPagination) {
                    this.productsViewAll = (productsPagination.length > productsPagination.size) ? true : false;
                    this.featuredProductsPagination = productsPagination; 
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
                    // this.categories = (categories.length >= 8) ? categories.slice(0, 8) : categories;
                    // if (categories.length >= 8) this.categoriesViewAll = true;
                    this.categories = categories;

                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            let orderService = this._apiServer.settings.apiServer.orderService;

        // Get banners
        this._adsService.ads$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((ads: Ad[]) => {
                if (ads) {
                    // to show only 8
                    this.ads = ads;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // ----------------------
        // Fuse Media Watcher
        // ----------------------

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {               

                this.currentScreenSize = matchingAliases;                

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
                        return this._locationService.getFeaturedStores({ page: this.featuredStoresPageOfItems['currentPage'] - 1, pageSize: this.featuredStoresPageOfItems['pageSize'], sortByCol: 'sequence', sortingOrder: 'ASC', regionCountryId: this.platform.country});
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
                        return this._locationService.getFeaturedProducts({ page: this.featuredProductsPageOfItems['currentPage'] - 1, pageSize: this.featuredProductsPageOfItems['pageSize'], sortByCol: 'sequence', sortingOrder: 'ASC', regionCountryId: this.platform.country});
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);
    }
 
    onChangePage(pageOfItems: Array<any>, type: string) {
        
        // update current page of items
        if (type === 'store') {
            this.featuredStoresPageOfItems = pageOfItems;
            if( this.featuredStoresPagination && this.featuredStoresPageOfItems['currentPage']) {
                if (this.featuredStoresPageOfItems['currentPage'] - 1 !== this.featuredStoresPagination.page) {
                    // set loading to true
                    this.isLoading = true;
        
                    this._locationService.getFeaturedStores({ page: this.featuredStoresPageOfItems['currentPage'] - 1, pageSize: this.featuredStoresPageOfItems['pageSize'], sortByCol: 'sequence', sortingOrder: 'ASC', regionCountryId: this.platform.country})
                        .subscribe(()=>{
                            // set loading to false
                            this.isLoading = false;
                        });
                }
            }        
        }
        if (type === 'product') {
            // update current page of items
            this.featuredProductsPageOfItems = pageOfItems;
            if( this.featuredProductsPagination && this.featuredProductsPageOfItems['currentPage']) {
                if (this.featuredProductsPageOfItems['currentPage'] - 1 !== this.featuredProductsPagination.page) {
                    // set loading to true
                    this.isLoading = true;
        
                    this._locationService.getFeaturedProducts({ page: this.featuredProductsPageOfItems['currentPage'] - 1, pageSize: this.featuredProductsPageOfItems['pageSize'], sortByCol: 'sequence', sortingOrder: 'ASC', regionCountryId: this.platform.country})
                        .subscribe(()=>{
                            // set loading to false
                            this.isLoading = false;
                        });
                }
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

    scroll(id) {
        this._scroller.scrollToAnchor(id)
    }
}
