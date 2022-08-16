import { ViewportScroller } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { AdsService } from 'app/core/ads/ads.service';
import { Ad } from 'app/core/ads/ads.types';
import { LocationService } from 'app/core/location/location.service';
import { ParentCategory, LandingLocation, StoresDetails, ProductDetails, ProductDetailPagination, StoresDetailPagination } from 'app/core/location/location.types';
import { NavigateService } from 'app/core/navigate-url/navigate.service';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { map, merge, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-search',
    templateUrl  : './search.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingSearchComponent implements OnInit
{
    @ViewChild("storesDetailsPaginator", {read: MatPaginator}) private _storesDetailsPaginator: MatPaginator;
    @ViewChild("featuredStoresPaginator", {read: MatPaginator}) private _featuredStoresPaginator: MatPaginator;
    @ViewChild("productsDetailsPaginator", {read: MatPaginator}) private _productsDetailsPaginator: MatPaginator;
    @ViewChild("featuredProductsPaginator", {read: MatPaginator}) private _featuredProductsPaginator: MatPaginator;


    platform    : Platform;
    locations   : LandingLocation[] = [];
    categories  : ParentCategory[] = [];
    
    searchValue : string;
    tagValue    : string;
    
    currentScreenSize: string[] = [];
    ads: Ad[] = [];
    
    // featured stores
    featuredStoresTitle: string = "Featured Shops";
    featuredStores: StoresDetails[] = [];
    featuredStoresPagination: StoresDetailPagination;
    featuredStoresPageOfItems: Array<any>;
    featuredStoresPageSize: number = 9;
    oldFeaturedStoresPaginationIndex: number = 0;

    // store details
    storesDetailsTitle: string = "Shops";
    storesDetails: StoresDetails[] = [];
    storesDetailsPagination: StoresDetailPagination;
    storesDetailsPageOfItems: Array<any>;
    storesDetailsPageSize: number = 9;
    oldStoresDetailsPaginationIndex: number = 0;
    
    // featured products
    featuredProductsTitle: string = "Featured Items";
    featuredProducts: ProductDetails[] = [];
    featuredProductsPagination: ProductDetailPagination;
    featuredProductsPageOfItems: Array<any>;
    featuredProductsPageSize: number = 19;
    oldFeaturedProductsPaginationIndex: number = 0;

    // product detauls
    productsDetailsTitle: string = "Items";
    productsDetails: ProductDetails[] = [];
    productsDetailsPagination: ProductDetailPagination;
    productsDetailsPageOfItems: Array<any>;
    productsDetailsPageSize: number = 19;
    oldProductsDetailsPaginationIndex: number = 0;

    isLoading: boolean;

    currentLocation: { lat: number; lng: number; } = null;
    currentLat  : number = null;
    currentLong : number = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _activatedRoute: ActivatedRoute,
        private _locationService: LocationService,
        private _adsService: AdsService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _navigate: NavigateService,
        private _scroller: ViewportScroller,
    )
    {
    }

    ngOnInit(): void {

        // Get platform
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                this.platform = platform;

                if (this.platform) {
                    // Get searches from url parameter 
                    this._activatedRoute.queryParams.subscribe(params => {
                        this.searchValue = params['keyword'];
                        this.tagValue = params['tag'];

                        this.currentLat = params['lat'];
                        this.currentLong = params['lng'];
                        
                        this.currentLocation = (this.currentLat && this.currentLong) ? {lat: this.currentLat, lng: this.currentLong} : null;
                        
                        // get back the previous pagination page
                        // more than 2 means it won't get back the previous pagination page when navigate back from 'carts' page
                        if (this._navigate.getPreviousUrl() && this._navigate.getPreviousUrl().split("/").length > 2) {              
                            this.oldStoresDetailsPaginationIndex = this.storesDetailsPagination ? this.storesDetailsPagination.page : 0;
                            this.oldProductsDetailsPaginationIndex = this.productsDetailsPagination ? this.productsDetailsPagination.page : 0;
                        }

                        this._locationService.featuredProducts = null;
                        this._locationService.productsDetails = null;
                        this._locationService.featuredStores = null;
                        this._locationService.storesDetails = null;
                        
                        if (!this.currentLocation || this.searchValue) {
                            
                            // Get products
                            this._locationService.getProductsDetails({ 
                                name            : this.searchValue, 
                                page            : this.oldProductsDetailsPaginationIndex,
                                pageSize        : this.productsDetailsPageSize, 
                                sortByCol       : 'created', 
                                sortingOrder    : 'DESC', 
                                regionCountryId : this.platform.country, 
                                latitude        : this.currentLat, 
                                longitude       : this.currentLong, 
                                storeTagKeyword : this.tagValue,
                                status          : ['ACTIVE', 'OUTOFSTOCK']
                            })
                            .subscribe(()=>{});
                        }

                        this._locationService.getFeaturedStores({
                            storeName       : this.searchValue, 
                            page            : this.oldFeaturedStoresPaginationIndex,
                            pageSize        : this.featuredStoresPageSize, 
                            sortByCol       : 'sequence', 
                            sortingOrder    : 'ASC', 
                            regionCountryId : this.platform.country, 
                            latitude        : this.currentLat, 
                            longitude       : this.currentLong,
                            isMainLevel     : false
                        }).subscribe((featuredStore: StoresDetails[])=>{
                            if (this.currentLocation) { this.featuredStoresTitle = "Discover Shops Near Me"; this.storesDetailsTitle = "Discover Shops Near Me" };
                            if (featuredStore && featuredStore.length < 1) {
                                this._locationService.getStoresDetails({ 
                                    storeName       : this.searchValue, 
                                    page            : this.oldStoresDetailsPaginationIndex,
                                    pageSize        : this.storesDetailsPageSize, 
                                    sortByCol       : 'created', 
                                    sortingOrder    : 'DESC', 
                                    regionCountryId : this.platform.country, 
                                    tagKeyword      : this.tagValue, 
                                    latitude        : this.currentLat, 
                                    longitude       : this.currentLong 
                                })
                                .subscribe((storesDetails: StoresDetails[])=>{
                                });
                            }
                        });

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Stores
        this._locationService.featuredStores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores: StoresDetails[]) => {
                this.featuredStores = stores;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            
        // Get the featured store pagination
        this._locationService.featuredStoresPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: StoresDetailPagination) => {
                // Update the pagination
                this.featuredStoresPagination = pagination;                   
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Stores Details
        this._locationService.storesDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores: StoresDetails[]) => {
                this.storesDetails = stores;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            
        // Get the store Details pagination
        this._locationService.storesDetailPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: StoresDetailPagination) => {
                // Update the pagination
                this.storesDetailsPagination = pagination;                   
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Products
        this._locationService.featuredProducts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products : ProductDetails[]) => {
                this.featuredProducts = products;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the product Details pagination
        this._locationService.featuredProductsPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ProductDetailPagination) => {
                // Update the pagination
                this.featuredProductsPagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            
        // Get Products Details
        this._locationService.productsDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products : ProductDetails[]) => {                
                this.productsDetails = products;                    
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the product Details pagination
        this._locationService.productDetailPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ProductDetailPagination) => {
                // Update the pagination
                this.productsDetailsPagination = pagination;                   
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
                            storeName       : this.searchValue, 
                            page            : this.featuredStoresPageOfItems['currentPage'] - 1, 
                            pageSize        : this.featuredStoresPageOfItems['pageSize'], 
                            sortByCol       : 'sequence', 
                            sortingOrder    : 'ASC',
                            regionCountryId : this.platform.country, 
                            latitude        : this.currentLat, 
                            longitude       : this.currentLong, 
                            isMainLevel     : false
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
                        return this._locationService.getStoresDetails({ 
                            storeName       : this.searchValue, 
                            page            : this.storesDetailsPageOfItems['currentPage'] - 1, 
                            pageSize        : this.storesDetailsPageOfItems['pageSize'], 
                            sortByCol       : 'created', 
                            sortingOrder    : 'DESC',
                            regionCountryId : this.platform.country, 
                            tagKeyword      : this.tagValue, 
                            latitude        : this.currentLat, 
                            longitude       : this.currentLong 
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
                            storeName       : this.searchValue, 
                            page            : this.featuredProductsPageOfItems['currentPage'] - 1, 
                            pageSize        : this.featuredProductsPageOfItems['pageSize'], 
                            sortByCol       : 'sequence', 
                            sortingOrder    : 'ASC',
                            regionCountryId : this.platform.country, 
                            status          : ['ACTIVE', 'OUTOFSTOCK'],
                            latitude        : this.currentLat, 
                            longitude       : this.currentLong,
                            isMainLevel     : false
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
                        return this._locationService.getProductsDetails({ 
                            name            : this.searchValue, 
                            page            : this.productsDetailsPageOfItems['currentPage'] - 1, 
                            pageSize        : this.productsDetailsPageOfItems['pageSize'], 
                            sortByCol       : 'created', 
                            sortingOrder    : 'DESC',
                            regionCountryId : this.platform.country, 
                            status          : ['ACTIVE', 'OUTOFSTOCK'],
                            latitude        : this.currentLat, 
                            longitude       : this.currentLong, 
                            storeTagKeyword : this.tagValue
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
        if (type === 'featuredStores') {
            this.featuredStoresPageOfItems = pageOfItems;
            if( this.featuredStoresPagination && this.featuredStoresPageOfItems['currentPage']) {
                if (this.featuredStoresPageOfItems['currentPage'] - 1 !== this.featuredStoresPagination.page) {
                    // set loading to true
                    this.isLoading = true;
        
                    this._locationService.getFeaturedStores({ 
                            storeName       : this.searchValue, 
                            page            : this.featuredStoresPageOfItems['currentPage'] - 1, 
                            pageSize        : this.featuredStoresPageOfItems['pageSize'],
                            sortByCol       : 'sequence', 
                            sortingOrder    : 'ASC', 
                            regionCountryId : this.platform.country, 
                            latitude        : this.currentLat, 
                            longitude       : this.currentLong,
                            isMainLevel     : false
                        })
                        .subscribe(()=>{
                            // set loading to false
                            this.isLoading = false;
                        });
                }
            }        
        }
        if (type === 'storesDetails') {
            this.storesDetailsPageOfItems = pageOfItems;
            if( this.storesDetailsPagination && this.storesDetailsPageOfItems['currentPage']) {
                if (this.storesDetailsPageOfItems['currentPage'] - 1 !== this.storesDetailsPagination.page) {
                    // set loading to true
                    this.isLoading = true;
        
                    this._locationService.getStoresDetails({ 
                            storeName       : this.searchValue, 
                            page            : this.storesDetailsPageOfItems['currentPage'] - 1, 
                            pageSize        : this.storesDetailsPageOfItems['pageSize'],
                            sortByCol       : 'created', 
                            sortingOrder    : 'DESC', 
                            regionCountryId : this.platform.country, 
                            tagKeyword      : this.tagValue, 
                            latitude        : this.currentLat, 
                            longitude       : this.currentLong 
                        })
                        .subscribe(()=>{
                            // set loading to false
                            this.isLoading = false;
                        });
                }
            }        
        }
        if (type === 'featuredProducts') {
            // update current page of items
            this.featuredProductsPageOfItems = pageOfItems;
            if( this.featuredProductsPagination && this.featuredProductsPageOfItems['currentPage']) {
                if (this.featuredProductsPageOfItems['currentPage'] - 1 !== this.featuredProductsPagination.page) {
                    // set loading to true
                    this.isLoading = true;
        
                    this._locationService.getFeaturedProducts({ 
                            storeName            : this.searchValue, 
                            page            : this.featuredProductsPageOfItems['currentPage'] - 1, 
                            pageSize        : this.featuredProductsPageOfItems['pageSize'], 
                            sortByCol       : 'sequence', 
                            sortingOrder    : 'ASC',
                            regionCountryId : this.platform.country, 
                            status          : ['ACTIVE', 'OUTOFSTOCK'],
                            latitude        : this.currentLat, 
                            longitude       : this.currentLong,
                            isMainLevel     : false
                        })
                        .subscribe(()=>{
                            // set loading to false
                            this.isLoading = false;
                        });
                }
            }
        }
        if (type === 'productsDetails') {
            // update current page of items
            this.productsDetailsPageOfItems = pageOfItems;
            if( this.productsDetailsPagination && this.productsDetailsPageOfItems['currentPage']) {
                if (this.productsDetailsPageOfItems['currentPage'] - 1 !== this.productsDetailsPagination.page) {
                    // set loading to true
                    this.isLoading = true;
        
                    this._locationService.getProductsDetails({ 
                            name            : this.searchValue, 
                            page            : this.productsDetailsPageOfItems['currentPage'] - 1, 
                            pageSize        : this.productsDetailsPageOfItems['pageSize'], 
                            sortByCol       : 'created', 
                            sortingOrder    : 'DESC',
                            regionCountryId : this.platform.country, 
                            status          : ['ACTIVE', 'OUTOFSTOCK'],
                            latitude        : this.currentLat, 
                            longitude       : this.currentLong, 
                            storeTagKeyword : this.tagValue
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

    scroll(id) {
        this._scroller.scrollToAnchor(id)
    }
}
