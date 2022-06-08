import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, LocationArea, ParentCategory, ProductDetails, StoreDetails, StoresDetails } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { ProductPagination, StorePagination } from 'app/core/store/store.types';

@Component({
    selector     : 'location',
    templateUrl  : './location.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LocationComponent implements OnInit
{

    platform: Platform;
    
    categoryId: string;
    category: ParentCategory;
    categories: ParentCategory[] = [];
    
    locationId: string;
    location: LandingLocation;
    adjacentLocationIds: string[] = [];
    
    stores: StoresDetails[] = [];
    featuredStoresPagination: StorePagination;
    
    products: ProductDetails[] = [];
    featuredProductsPagination: ProductPagination;
    
    redirectUrl: { categoryId?: string, locationId?: string }
    storesViewAll: boolean = false;
    productsViewAll: boolean = false;
    categoriesViewAll: boolean = false;

    maxStoresDisplay: number = 3;
    maxProductsDisplay: number = 9;
    maxCategoriesDisplay: number = 4;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _route: ActivatedRoute,
        private _locationService: LocationService,
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

        // Get parent category by Id when change route - this is when we pick the category
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe((responseLocation: NavigationEnd) => {
            if (responseLocation) {
                this.categoryId = responseLocation.url.split("/")[3];

                // Reset current category
                this._locationService.parentCategory = null;

                // Get current category with parentCategoryId
                this._locationService.getParentCategories({ pageSize: 1, regionCountryId: this.platform.country, parentCategoryId: this.categoryId })
                    .subscribe((category : ParentCategory[]) => {});

                // Get adjacent city first
                this._locationService.getLocationArea(this.locationId)
                    .subscribe((response: LocationArea[]) => {
                        this.adjacentLocationIds = [];
                        this.adjacentLocationIds = response.map(item => {
                            return item.storeCityId;
                        });

                        if (this.adjacentLocationIds.length > 0) {
                            this.adjacentLocationIds.unshift(this.locationId);
                        }
                
                        // Get Featured Stores
                        this._locationService.getFeaturedStores({pageSize: this.maxStoresDisplay, cityId: this.adjacentLocationIds, regionCountryId: this.platform.country, sortByCol: 'sequence', sortingOrder: 'ASC', parentCategoryId: this.categoryId })
                            .subscribe(()=>{});

                        // Get featured products
                        this._locationService.getFeaturedProducts({pageSize: this.maxProductsDisplay, regionCountryId: this.platform.country, cityId: this.adjacentLocationIds, sortByCol: 'sequence', sortingOrder: 'ASC', parentCategoryId: this.categoryId })
                            .subscribe((products : ProductDetails[]) => {
                            });
                    });
            }
        });

        // Get Platform Data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                if (platform) {
                    this.platform = platform;
                    
                    // Get current location with locationId 
                    this._locationService.getFeaturedLocations({ pageSize: 1, regionCountryId: this.platform.country, cityId: this.locationId, sortByCol: 'sequence', sortingOrder: 'ASC' })
                        .subscribe((location : LandingLocation[]) => {});

                    // Reset current category
                    this._locationService.parentCategory = null;
                    
                    // Get current category with parentCategoryId
                    this._locationService.getParentCategories({ pageSize: 1, regionCountryId: this.platform.country, parentCategoryId: this.categoryId })
                        .subscribe((category : ParentCategory[]) => {});

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
        
                            // Get categories
                            this._locationService.getParentCategories({ pageSize: this.maxCategoriesDisplay, regionCountryId: this.platform.country, cityId: this.adjacentLocationIds })
                                .subscribe((category : ParentCategory[]) => {});
        
                            // Get Featured Stores
                            this._locationService.getFeaturedStores({pageSize: this.maxStoresDisplay, regionCountryId: this.platform.country, cityId: this.adjacentLocationIds, sortByCol: 'sequence', sortingOrder: 'ASC', parentCategoryId: this.categoryId })
                                .subscribe((stores : StoresDetails[]) => {});
        
                            // Get featured products
                            this._locationService.getFeaturedProducts({pageSize: this.maxProductsDisplay, regionCountryId: this.platform.country, cityId: this.adjacentLocationIds, sortByCol: 'sequence', sortingOrder: 'ASC', parentCategoryId: this.categoryId })
                                .subscribe((products : ProductDetails[]) => {});
                        });
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });


        // Get Current parentCategory
        this._locationService.parentCategory$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(category => {
                if (category) {                    
                    this.category = category;
                }                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            
        // Get all parentCategories
        this._locationService.parentCategories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: ParentCategory[]) => {
                if (categories) {
                    // to show only maxCategoriesDisplay
                    // this is to block more that maxCategoriesDisplay if coming from home category resolver 
                    this.categories = (categories.length >= this.maxCategoriesDisplay) ? categories.slice(0, this.maxCategoriesDisplay) : categories;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get parentCategories pagination
        this._locationService.parentCategoriesPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) => { 
                if (pagination) {       
                    this.categoriesViewAll = (pagination.length > pagination.size) ? true : false;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Current Location
        this._locationService.featuredLocation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((location: LandingLocation) => {
                if (location) {
                    this.location = location;                    
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Get Featured Stores
        this._locationService.featuredStores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores: StoresDetails[]) => { 
                if (stores) {
                    this.stores = stores;                     
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Stores
        this._locationService.featuredStorePagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) => { 
                if (pagination) {               
                    this.featuredStoresPagination = pagination;     
                    this.storesViewAll = (pagination.length > pagination.size) ? true : false;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        

        // Get Featured Products
        this._locationService.featuredProducts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductDetails[]) => { 
                if (products) {
                    this.products = products;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Products pagination
        this._locationService.featuredProductPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) => { 
                if (pagination) {
                    this.featuredProductsPagination = pagination;              
                    this.productsViewAll = (pagination.length > pagination.size) ? true : false;
                }
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
