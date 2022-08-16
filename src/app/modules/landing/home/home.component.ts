import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { LocationService } from 'app/core/location/location.service';
import { ParentCategory, LandingLocation, StoresDetails, ProductDetails } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { ProductPagination, StorePagination } from 'app/core/store/store.types';
import { map, merge, Subject, switchMap, takeUntil, combineLatest } from 'rxjs';
import { AdsService } from 'app/core/ads/ads.service';
import { Ad } from 'app/core/ads/ads.types';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { ViewportScroller } from '@angular/common';
import { NavigateService } from 'app/core/navigate-url/navigate.service';
import { CurrentLocationService } from 'app/core/_current-location/current-location.service';
import { CurrentLocation } from 'app/core/_current-location/current-location.types';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent implements OnInit
{
    @ViewChild("featuredStoresPaginator", {read: MatPaginator}) private _featuredStoresPaginator: MatPaginator;
    @ViewChild("featuredProductsPaginator", {read: MatPaginator}) private _featuredProductsPaginator: MatPaginator;
    @ViewChild("storesDetailsPaginator", {read: MatPaginator}) private _storesDetailsPaginator: MatPaginator;
    @ViewChild("productsDetailsPaginator", {read: MatPaginator}) private _productsDetailsPaginator: MatPaginator;

    platform: Platform;

    locations: LandingLocation[] = [];
    locationsViewAll : boolean = false;

    categories: ParentCategory[] = [];
    categoriesViewAll: boolean = false;

    // featured stores
    featuredStoresTitle: string = "Featured Shops";
    featuredStores: StoresDetails[] = [];
    featuredStoresPagination: StorePagination;
    featuredStoresPageOfItems: Array<any>;
    featuredStorePageSize: number = 9;
    oldFeaturedStoresPaginationIndex: number = 0;

    // store details
    storesDetailsTitle: string = "Shops";
    storesDetails: StoresDetails[] = [];
    storesDetailsPagination: StorePagination;
    storesDetailsPageOfItems: Array<any>;
    storesDetailsPageSize: number = 9;
    oldStoresDetailsPaginationIndex: number = 0;

    // featured products
    featuredProductsTitle: string = "Featured Items";
    featuredProducts: ProductDetails[] = [];
    featuredProductsPagination: ProductPagination;
    featuredProductsPageOfItems: Array<any>;
    featuredProductPageSize = 19;
    oldFeaturedProductsPaginationIndex: number = 0;

    // product detauls
    productsDetailsTitle: string = "Items";
    productsDetails: ProductDetails[] = [];
    productsDetailsPagination: ProductPagination;
    productsDetailsPageOfItems: Array<any>;
    productsDetailsPageSize = 19;
    oldProductsDetailsPaginationIndex: number = 0;

    isLoading: boolean = false;
    currentScreenSize: string[] = [];
    ads: Ad[] = [];

    currentLocation: CurrentLocation;

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
        private _currentLocationService: CurrentLocationService,
        private _scroller: ViewportScroller,
        private _navigate: NavigateService
    )
    {
    }

    ngOnInit(): void {

        combineLatest([
            this._currentLocationService.currentLocation$,
            this._platformsService.platform$
        ]).pipe(takeUntil(this._unsubscribeAll))
        .subscribe(([currentLocation, platform] : [CurrentLocation, Platform])=>{
            if (currentLocation && platform) {
                this.platform = platform;
                this.currentLocation = currentLocation;

                let currentLat = currentLocation.isAllowed ? currentLocation.location.lat : null;
                let currentLong = currentLocation.isAllowed ? currentLocation.location.lng : null;

                // get back the previous pagination page
                // more than 2 means it won't get back the previous pagination page when navigate back from 'carts' page
                if (this._navigate.getPreviousUrl() && this._navigate.getPreviousUrl().split("/").length > 2) {              
                    this.oldStoresDetailsPaginationIndex = this.storesDetailsPagination ? this.storesDetailsPagination.page : 0;
                    this.oldProductsDetailsPaginationIndex = this.productsDetailsPagination ? this.productsDetailsPagination.page : 0;
                }

                // Get categories
                this._locationService.getParentCategories({ pageSize: 50, regionCountryId: this.platform.country })
                    .subscribe((category : ParentCategory[]) => {
                    });

                // Get locations
                this._locationService.getFeaturedLocations({ pageSize: 50, sortByCol: 'sequence', sortingOrder: 'ASC', regionCountryId: this.platform.country })
                    .subscribe((location : LandingLocation[]) => {
                    });

                this._locationService.storesDetails = null;
                this._locationService.featuredStores = null;
                this._locationService.productsDetails = null;
                this._locationService.featuredProducts = null;

                if (this.currentLocation.isAllowed === false) {
                    // Get featured products
                    this._locationService.getFeaturedProducts({ 
                        page            : this.oldFeaturedProductsPaginationIndex, 
                        pageSize        : this.featuredProductPageSize, 
                        sortByCol       : 'mainLevelSequence', 
                        sortingOrder    : 'ASC', 
                        status          : ['ACTIVE', 'OUTOFSTOCK'],
                        regionCountryId : this.platform.country,
                        isMainLevel     : true
                    })
                    .subscribe((featuredProducts : ProductDetails[]) => {
                        // if featured products not found at backend
                        if (featuredProducts && featuredProducts.length < 1) {
                            this._locationService.getProductsDetails({
                                page            : this.oldProductsDetailsPaginationIndex,
                                pageSize        : this.productsDetailsPageSize,
                                sortByCol       : 'created',
                                sortingOrder    : 'DESC',
                                status          : ['ACTIVE', 'OUTOFSTOCK'],
                                regionCountryId : this.platform.country
                            })
                            .subscribe((productsDetails: ProductDetails[])=>{
                            });
                        }
                    });
                } 

                // Get featured stores
                this._locationService.getFeaturedStores({ 
                    page            : this.oldFeaturedStoresPaginationIndex, 
                    pageSize        : this.featuredStorePageSize, 
                    sortByCol       : 'mainLevelSequence', 
                    sortingOrder    : 'ASC', 
                    regionCountryId : this.platform.country,
                    isMainLevel     : true,
                    latitude        : currentLat,
                    longitude       : currentLong
                })
                .subscribe((featuredStores : StoresDetails[]) => {
                    if (this.currentLocation.isAllowed) { this.featuredStoresTitle = "Discover Shops Near Me"; this.storesDetailsTitle = "Discover Shops Near Me" };
                    if (featuredStores && featuredStores.length < 1) {
                        // if featured stores not found at backend
                        this._locationService.getStoresDetails({
                            page            : this.oldStoresDetailsPaginationIndex,
                            pageSize        : this.storesDetailsPageSize,
                            sortByCol       : 'created', 
                            sortingOrder    : 'DESC', 
                            regionCountryId : this.platform.country
                        })
                        .subscribe((storesDetails: StoresDetails[])=>{
                        });
                    }
                });
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

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

        // Get featured products
        this._locationService.featuredProducts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products) => {
                this.featuredProducts = products;  
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get featured product pagination
        this._locationService.featuredProductsPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((productsPagination) => {
                    this.featuredProductsPagination = productsPagination; 
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get featured stores
        this._locationService.featuredStores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores) => {
                this.featuredStores = stores;  
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get featured stores pagination
        this._locationService.featuredStoresPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((storesPagination) => {
                this.featuredStoresPagination = storesPagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get products details
        this._locationService.productsDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products) => {
                this.productsDetails = products;  
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get featured product pagination
        this._locationService.productDetailPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((productsPagination) => {
                this.productsDetailsPagination = productsPagination; 
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get featured stores
        this._locationService.storesDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores) => {
                this.storesDetails = stores;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get featured stores pagination
        this._locationService.storesDetailPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((storesPagination) => {
                this.storesDetailsPagination = storesPagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

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
            if (this._featuredStoresPaginator )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._featuredStoresPaginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._locationService.getFeaturedStores({ 
                            page            : this.featuredStoresPageOfItems['currentPage'] - 1, 
                            pageSize        : this.featuredStoresPageOfItems['pageSize'], 
                            sortByCol       : 'mainLevelSequence', 
                            sortingOrder    : 'ASC', 
                            regionCountryId : this.platform.country,
                            isMainLevel     : true,
                            latitude        : this.currentLocation.isAllowed ? this.currentLocation.location.lat : null,
                            longitude       : this.currentLocation.isAllowed ? this.currentLocation.location.lng : null,
                        });
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
            if (this._featuredProductsPaginator )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._featuredProductsPaginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._locationService.getFeaturedProducts({ 
                            page            : this.featuredProductsPageOfItems['currentPage'] - 1, 
                            pageSize        : this.featuredProductsPageOfItems['pageSize'], 
                            sortByCol       : 'mainLevelSequence', 
                            sortingOrder    : 'ASC', 
                            status          : ['ACTIVE', 'OUTOFSTOCK'],
                            regionCountryId : this.platform.country,
                            isMainLevel     : true,
                            latitude        : this.currentLocation.isAllowed ? this.currentLocation.location.lat : null,
                            longitude       : this.currentLocation.isAllowed ? this.currentLocation.location.lng : null
                        });
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
            if (this._storesDetailsPaginator )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._storesDetailsPaginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;

                        let latitude: number = this.currentLocation.isAllowed ? this.currentLocation.location.lat : null;
                        let longitude: number = this.currentLocation.isAllowed ? this.currentLocation.location.lng : null;
                        
                        // this rules is requested by eleen, where if there were not no location available in featured
                        // but still want to something to customer
                        latitude = this.featuredStores && this.featuredStores.length > 1 ?  latitude : null;
                        longitude = this.featuredStores && this.featuredStores.length > 1 ?  longitude : null;

                        return this._locationService.getStoresDetails({ 
                            page            : this.storesDetailsPageOfItems['currentPage'] - 1, 
                            pageSize        : this.storesDetailsPageOfItems['pageSize'], 
                            sortByCol       : 'created', 
                            sortingOrder    : 'DESC', 
                            regionCountryId : this.platform.country,
                            latitude        : latitude,
                            longitude       : longitude,
                        });
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
            if (this._productsDetailsPaginator )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._productsDetailsPaginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;

                        let latitude: number = this.currentLocation.isAllowed ? this.currentLocation.location.lat : null;
                        let longitude: number = this.currentLocation.isAllowed ? this.currentLocation.location.lng : null;
                        
                        // this rules is requested by eleen, where if there were not no location available in featured
                        // but still want to something to customer
                        latitude = this.featuredProducts && this.featuredProducts.length > 1 ?  latitude : null;
                        longitude = this.featuredProducts && this.featuredProducts.length > 1 ?  longitude : null;

                        return this._locationService.getProductsDetails({ 
                            page            : this.productsDetailsPageOfItems['currentPage'] - 1, 
                            pageSize        : this.productsDetailsPageOfItems['pageSize'], 
                            sortByCol       : 'created', 
                            sortingOrder    : 'DESC', 
                            status          : ['ACTIVE', 'OUTOFSTOCK'],
                            regionCountryId : this.platform.country,
                            latitude        : latitude,
                            longitude       : longitude
                        });
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
        if (type === 'featuredStore') {
            this.featuredStoresPageOfItems = pageOfItems;
            if( this.featuredStoresPagination && this.featuredStoresPageOfItems['currentPage']) {
                if (this.featuredStoresPageOfItems['currentPage'] - 1 !== this.featuredStoresPagination.page) {
                    // set loading to true
                    this.isLoading = true;
        
                    this._locationService.getFeaturedStores({ 
                        page            : this.featuredStoresPageOfItems['currentPage'] - 1, 
                        pageSize        : this.featuredStoresPageOfItems['pageSize'], 
                        sortByCol       : 'mainLevelSequence', 
                        sortingOrder    : 'ASC', 
                        regionCountryId : this.platform.country,
                        isMainLevel     : true,
                        latitude        : this.currentLocation.isAllowed ? this.currentLocation.location.lat : null,
                        longitude       : this.currentLocation.isAllowed ? this.currentLocation.location.lng : null
                    })
                    .subscribe(()=>{
                        // set loading to false
                        this.isLoading = false;
                    });
                }
            }        
        }
        if (type === 'featuredProduct') {
            // update current page of items
            this.featuredProductsPageOfItems = pageOfItems;
            if( this.featuredProductsPagination && this.featuredProductsPageOfItems['currentPage']) {
                if (this.featuredProductsPageOfItems['currentPage'] - 1 !== this.featuredProductsPagination.page) {
                    // set loading to true
                    this.isLoading = true;
        
                    this._locationService.getFeaturedProducts({ 
                        page            : this.featuredProductsPageOfItems['currentPage'] - 1, 
                        pageSize        : this.featuredProductsPageOfItems['pageSize'], 
                        sortByCol       : 'mainLevelSequence', 
                        sortingOrder    : 'ASC', 
                        status          : ['ACTIVE', 'OUTOFSTOCK'],
                        regionCountryId : this.platform.country, 
                        isMainLevel     : true,
                        latitude        : this.currentLocation.isAllowed ? this.currentLocation.location.lat : null,
                        longitude       : this.currentLocation.isAllowed ? this.currentLocation.location.lng : null, 
                    })
                    .subscribe(()=>{
                        // set loading to false
                        this.isLoading = false;
                    });
                }
            }
        }
        if (type === 'storeDetails') {
            this.storesDetailsPageOfItems = pageOfItems;
            if( this.storesDetailsPagination && this.storesDetailsPageOfItems['currentPage']) {
                if (this.storesDetailsPageOfItems['currentPage'] - 1 !== this.storesDetailsPagination.page) {
                    // set loading to true
                    this.isLoading = true;

                    let latitude: number = this.currentLocation.isAllowed ? this.currentLocation.location.lat : null;
                    let longitude: number = this.currentLocation.isAllowed ? this.currentLocation.location.lng : null;
                    
                    // this rules is requested by eleen, where if there were not no location available in featured
                    // but still want to something to customer
                    latitude = this.featuredStores && this.featuredStores.length > 1 ?  latitude : null;
                    longitude = this.featuredStores && this.featuredStores.length > 1 ?  longitude : null;
        
                    this._locationService.getStoresDetails({ 
                        page            : this.storesDetailsPageOfItems['currentPage'] - 1, 
                        pageSize        : this.storesDetailsPageOfItems['pageSize'], 
                        sortByCol       : 'created', 
                        sortingOrder    : 'DESC', 
                        regionCountryId : this.platform.country,
                        latitude        : latitude,
                        longitude       : longitude
                    })
                    .subscribe(()=>{
                        // set loading to false
                        this.isLoading = false;
                    });
                }
            }        
        }
        if (type === 'productDetails') {
            // update current page of items
            this.productsDetailsPageOfItems = pageOfItems;
            if( this.productsDetailsPagination && this.productsDetailsPageOfItems['currentPage']) {
                if (this.productsDetailsPageOfItems['currentPage'] - 1 !== this.productsDetailsPagination.page) {
                    // set loading to true
                    this.isLoading = true;

                    let latitude: number = this.currentLocation.isAllowed ? this.currentLocation.location.lat : null;
                    let longitude: number = this.currentLocation.isAllowed ? this.currentLocation.location.lng : null;
                    
                    // this rules is requested by eleen, where if there were not no location available in featured
                    // but still want to something to customer
                    latitude = this.featuredProducts && this.featuredProducts.length > 1 ?  latitude : null;
                    longitude = this.featuredProducts && this.featuredProducts.length > 1 ?  longitude : null;
        
                    this._locationService.getProductsDetails({ 
                        page            : this.productsDetailsPageOfItems['currentPage'] - 1, 
                        pageSize        : this.productsDetailsPageOfItems['pageSize'], 
                        sortByCol       : 'created', 
                        sortingOrder    : 'DESC', 
                        status          : ['ACTIVE', 'OUTOFSTOCK'],
                        regionCountryId : this.platform.country, 
                        latitude        : latitude,
                        longitude       : longitude
                    })
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
