import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, LocationArea, LocationPagination, ParentCategory, ProductDetails, StoresDetails } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { combineLatest, distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { ProductPagination, StorePagination } from 'app/core/store/store.types';
import { CurrentLocationService } from 'app/core/_current-location/current-location.service';
import { CurrentLocation } from 'app/core/_current-location/current-location.types';

@Component({
    selector     : 'category',
    templateUrl  : './category.component.html',
    encapsulation: ViewEncapsulation.None
})
export class CategoryComponent implements OnInit
{
    platform: Platform;

    categoryId: string;
    category: ParentCategory;

    // Locations
    locationId: string;
    adjacentLocationIds: string[] = [];
    location: LandingLocation;
    locations: LandingLocation[] = [];
    featuredLocationPagination: LocationPagination;

    // Featured Stores
    featuredStoresTitle: string = "Featured Shops";
    featuredStores: StoresDetails[] = [];
    featuredStoresPagination: StorePagination;
    featuredStorePageSize: number = 9;
    oldFeaturedStoresPaginationIndex: number = 0;
    // Stores Details
    storesDetailsTitle: string = "Shops"
    storesDetails: StoresDetails[] = [];
    storesDetailsPagination: StorePagination;
    storesDetailsPageSize: number = 9;
    oldStoresDetailsPaginationIndex: number = 0;
    
    // Featured Products
    featuredProductsTitle: string = "Featured Items";
    featuredProducts: ProductDetails[] = [];
    featuredProductsPagination: ProductPagination;
    featuredProductPageSize: number = 19;
    oldFeaturedProductsPaginationIndex: number = 0;
    // Normal Products
    productsDetailsTitle: string = "Items";
    productsDetails: ProductDetails[] = [];
    productsDetailsPagination: ProductPagination;
    productsDetailsPageSize: number = 19;
    oldProductsDetailsPaginationIndex: number = 0;

    maxStoresDisplay: number = 5;
    maxProductsDisplay: number = 30;
    maxLocationsDisplay: number = 50;
    
    redirectUrl: { categoryId?: string, locationId?: string }
    locationsViewAll: boolean = false;

    currentLocation: CurrentLocation;

    isLoading: boolean = true;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _route: ActivatedRoute,
        private _locationService: LocationService,
        private _currentLocationService: CurrentLocationService,
        private _location: Location,
        private _router: Router,

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        this.locationId = this._route.snapshot.paramMap.get('location-id');
        this.categoryId = this._route.snapshot.paramMap.get('category-id');

        this.redirectUrl = {
            locationId : this.locationId,
            categoryId : this.categoryId
        }
        
        // Get location when change route - this is when we pick one location
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe((responseCategory: NavigationEnd) => {
            if (responseCategory) {
                this.locationId = responseCategory.url.split("/")[3];
                
                // Get current category with categoryId
                this._locationService.getParentCategories({pageSize: 1, regionCountryId: this.platform.country, parentCategoryId: this.categoryId })
                    .subscribe((category : ParentCategory[]) => {
                    });

                // Set current location to null since we don't have locationId
                this._locationService.featuredLocation = null;    

                // Get current location with locationId
                this._locationService.getFeaturedLocations({pageSize: 1, regionCountryId: this.platform.country, cityId: this.locationId, sortByCol: 'sequence', sortingOrder: 'ASC' })
                    .subscribe((location : LandingLocation[]) => {
                    });

                // Get adjacent city first
                this._locationService.getLocationArea(this.locationId)
                    .subscribe((response: LocationArea[]) => {
                        this.adjacentLocationIds = [];
                        this.adjacentLocationIds = response.map(item => {
                            return item.storeCityId;
                        });

                        // put the original this.locationId in the adjacentLocationIds
                        if (this.adjacentLocationIds.length > 0) {
                            this.adjacentLocationIds.unshift(this.locationId);
                        }
                        
                        // if locationId exists
                        if (this.adjacentLocationIds.length < 1 && this.locationId) {
                            this.adjacentLocationIds = [this.locationId];
                        }

                        this._locationService.getFeaturedLocations({pageSize: this.maxLocationsDisplay, regionCountryId: this.platform.country, cityId: this.adjacentLocationIds,  sortByCol: 'sequence', sortingOrder: 'ASC' })
                            .subscribe((locations : LandingLocation[]) => {});

                        this.productsDetails = null;
                        this.featuredProducts = null;
                        this.storesDetails = null;
                        this.featuredStores = null;

                        if (this.currentLocation.isAllowed === false) {
                            // Get featured products
                            this._locationService.getFeaturedProducts({ 
                                page            : this.oldFeaturedProductsPaginationIndex, 
                                pageSize        : this.featuredProductPageSize, 
                                sortByCol       : 'sequence', 
                                sortingOrder    : 'ASC',
                                status          : ['ACTIVE', 'OUTOFSTOCK'],
                                regionCountryId : this.platform.country,
                                cityId          : this.adjacentLocationIds, 
                                parentCategoryId: this.categoryId,
                                isMainLevel     : false
                            })
                            .subscribe((featuredProducts : ProductDetails[]) => {
                                this.featuredProductsTitle = "Discover Items";
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
                                        this.productsDetailsTitle = "Discover Items";
                                    });
                                }
                            });
                        } 

                        // Get featured stores
                        this._locationService.getFeaturedStores({ 
                            page            : this.oldFeaturedStoresPaginationIndex, 
                            pageSize        : this.featuredStorePageSize, 
                            sortByCol       : 'sequence', 
                            sortingOrder    : 'ASC', 
                            regionCountryId : this.platform.country,
                            cityId          : this.adjacentLocationIds, 
                            parentCategoryId: this.categoryId,
                            isMainLevel     : false
                        })
                        .subscribe((featuredStores : StoresDetails[]) => {
                            this.featuredStoresTitle = this.currentLocation.isAllowed ? "Discover Shops Near Me" : "Discover Shops";
                            if (featuredStores && featuredStores.length < 1) {
                                // if featured stores not found at backend
                                this._locationService.getStoresDetails({
                                    page            : this.oldStoresDetailsPaginationIndex,
                                    pageSize        : this.storesDetailsPageSize,
                                    sortByCol       : 'created', 
                                    sortingOrder    : 'DESC', 
                                    regionCountryId : this.platform.country,
                                    cityId          : this.adjacentLocationIds, 
                                    parentCategoryId: this.categoryId
                                })
                                .subscribe((storesDetails: StoresDetails[])=>{
                                    this.storesDetailsTitle = "Discover Shops";
                                });
                            }
                        });

                    });
            }
        });

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

                // Get current category with categoryId
                this._locationService.getParentCategories({
                    page            : 0,
                    pageSize        : 1,
                    regionCountryId : this.platform.country, 
                    parentCategoryId: this.categoryId,
                })
                .subscribe((category : ParentCategory[]) => {
                });

                // Set current location to null since we don't have locationId
                this._locationService.featuredLocation = null;    

                // Get current location with locationId
                this._locationService.getFeaturedLocations({
                    page            : 0, 
                    pageSize        : 1, 
                    regionCountryId : this.platform.country, 
                    cityId          : this.locationId, 
                    sortByCol       : 'sequence', 
                    sortingOrder    : 'ASC' 
                })
                .subscribe((location : LandingLocation[]) => {
                });                

                // Get adjacent city first
                this._locationService.getLocationArea(this.locationId)
                    .subscribe((response: LocationArea[]) => {                        

                        this.adjacentLocationIds = [];
                        this.adjacentLocationIds = response.map(item => {
                            return item.storeCityId;
                        });

                        // put the original this.locationId in the adjacentLocationIds
                        if (this.adjacentLocationIds.length > 0) {
                            this.adjacentLocationIds.unshift(this.locationId);
                        }
                        
                        // if locationId exists
                        if (this.adjacentLocationIds.length < 1 && this.locationId) {
                            this.adjacentLocationIds = [this.locationId];
                        }

                        // at this point this.adjacentLocationIds should have at least one locationId
                        // unless it's at main /category/<category-id> page
                        if (this.adjacentLocationIds.length > 0) {
                            currentLat = null;
                            currentLong = null;
                        }
                            
                        this._locationService.getFeaturedLocations({
                            page            : 0,
                            pageSize        : this.maxLocationsDisplay, 
                            regionCountryId : this.platform.country, 
                            cityId          : this.adjacentLocationIds, 
                            sortByCol       : 'sequence', 
                            sortingOrder    : 'ASC' 
                        })
                        .subscribe((locations : LandingLocation[]) => {});
                        
                        this._locationService.productsDetails = null;
                        this._locationService.featuredProducts = null;
                        this._locationService.storesDetails = null;
                        this._locationService.featuredStores = null;

                        if (this.currentLocation.isAllowed === false) {
                            // Get featured products
                            this._locationService.getFeaturedProducts({ 
                                page            : this.oldFeaturedProductsPaginationIndex, 
                                pageSize        : this.featuredProductPageSize, 
                                sortByCol       : 'sequence', 
                                sortingOrder    : 'ASC', 
                                status          : ['ACTIVE', 'OUTOFSTOCK'],
                                regionCountryId : this.platform.country,
                                cityId          : this.adjacentLocationIds,
                                parentCategoryId: this.categoryId,
                                isMainLevel     : false
                            })
                            .subscribe((featuredProducts : ProductDetails[]) => {
                                this.featuredProductsTitle = "Discover Items";
                                // if featured products not found at backend
                                if (featuredProducts && featuredProducts.length < 1) {
                                    this._locationService.getProductsDetails({
                                        page            : this.oldProductsDetailsPaginationIndex,
                                        pageSize        : this.productsDetailsPageSize,
                                        sortByCol       : 'created',
                                        sortingOrder    : 'DESC',
                                        status          : ['ACTIVE', 'OUTOFSTOCK'],
                                        regionCountryId : this.platform.country,
                                        cityId          : this.adjacentLocationIds,
                                        parentCategoryId: this.categoryId
                                    })
                                    .subscribe((productsDetails: ProductDetails[])=>{
                                        this.productsDetailsTitle = "Discover Items";
                                    });
                                }
                            });
                        } 

                        // Get featured stores
                        this._locationService.getFeaturedStores({ 
                            page            : this.oldFeaturedStoresPaginationIndex, 
                            pageSize        : this.featuredStorePageSize, 
                            sortByCol       : 'sequence', 
                            sortingOrder    : 'ASC', 
                            regionCountryId : this.platform.country,
                            cityId          : this.adjacentLocationIds,
                            parentCategoryId: this.categoryId,
                            latitude        : currentLat,
                            longitude       : currentLong,
                            isMainLevel     : false
                        })
                        .subscribe((featuredStores : StoresDetails[]) => {
                            this.featuredStoresTitle = (currentLat && currentLong) ? "Discover Shops Near Me" : "Discover Shops";
                            if (featuredStores && featuredStores.length < 1) {
                                // if featured stores not found at backend
                                this._locationService.getStoresDetails({
                                    page            : this.oldStoresDetailsPaginationIndex,
                                    pageSize        : this.storesDetailsPageSize,
                                    sortByCol       : 'created', 
                                    sortingOrder    : 'DESC', 
                                    regionCountryId : this.platform.country,
                                    cityId          : this.adjacentLocationIds,
                                    parentCategoryId: this.categoryId
                                })
                                .subscribe((storesDetails: StoresDetails[])=>{
                                    this.storesDetailsTitle = "Discover Shops";
                                });
                            }
                        });
                    });
            }   
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
            
        // Get current category
        this._locationService.parentCategory$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((category) => {
                if (category) {                    
                    this.category = category;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get current selected location
        this._locationService.featuredLocation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(location => {
                if (location) {
                    this.location = location;                
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get all locations
        this._locationService.featuredLocations$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((locations : LandingLocation[]) => {
                if (locations) {
                    this.locations = locations;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get all locations pagination
        this._locationService.featuredLocationPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) => {
                if (pagination) {
                    this.featuredLocationPagination = pagination;
                    this.locationsViewAll = (pagination.length > pagination.size) ? true : false;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Stores
        this._locationService.featuredStores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores: StoresDetails[]) => { 
                this.featuredStores = stores;
                this.isLoading = false;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Stores pagination
        this._locationService.featuredStoresPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: StorePagination) => { 
                this.featuredStoresPagination =  pagination;    
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Stores
        this._locationService.storesDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores: StoresDetails[]) => { 
                this.storesDetails = stores;
                this.isLoading = false;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Stores pagination
        this._locationService.storesDetailPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: StorePagination) => { 
                this.storesDetailsPagination =  pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Products
        this._locationService.featuredProducts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductDetails[]) => { 
                this.productsDetails = products;
                this.isLoading = false;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Products pagination
        this._locationService.featuredProductsPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) => { 
                this.featuredProductsPagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Products
        this._locationService.productsDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductDetails[]) => { 
                this.productsDetails = products;
                this.isLoading = false;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Products pagination
        this._locationService.productDetailPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) => { 
                this.productsDetailsPagination = pagination;    
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
    // @ Public Method
    // -----------------------------------------------------------------------------------------------------

    backClicked() {
        this._location.back();
    }
}
