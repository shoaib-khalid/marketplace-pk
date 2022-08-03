import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, LocationArea, ParentCategory, ProductDetails, StoreDetails, StoresDetails } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { distinctUntilChanged, filter, map, merge, Subject, switchMap, takeUntil, combineLatest } from 'rxjs';
import { Location } from '@angular/common';
import { ProductPagination, StorePagination } from 'app/core/store/store.types';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector     : 'location',
    templateUrl  : './location.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LocationComponent implements OnInit
{
    @ViewChild("storesPaginator", {read: MatPaginator}) private _storesPaginator: MatPaginator;
    @ViewChild("productsPaginator", {read: MatPaginator}) private _productsPaginator: MatPaginator;


    platform: Platform;
    
    categoryId: string;
    category: ParentCategory;
    categories: ParentCategory[] = [];
    
    locationId: string;
    location: LandingLocation;
    adjacentLocationIds: string[] = [];

    // Featured Stores
    featuredStores: StoresDetails[] = [];
    featuredStoresPagination: StorePagination;
    featuredStoresPageOfItems: Array<any>;
    // Stores
    stores: StoresDetails[] = [];
    storesPagination: StorePagination;
    storesPageOfItems: Array<any>;

    // Featured Products
    featuredProducts: ProductDetails[] = [];
    featuredProductsPagination: ProductPagination;
    featuredProductsPageOfItems: Array<any>;
    // Products
    products: ProductDetails[] = [];
    productsPagination: ProductPagination;
    productsPageOfItems: Array<any>;
    
    redirectUrl: { categoryId?: string, locationId?: string }
    storesViewAll: boolean = false;
    productsViewAll: boolean = false;
    categoriesViewAll: boolean = false;

    maxStoresDisplay: number = 5;
    maxProductsDisplay: number = 30;
    maxCategoriesDisplay: number = 50;
    
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
                        this.adjacentLocationIds.unshift(this.locationId);
                        // Get Featured Stores
                        this._locationService.getFeaturedStores({pageSize: this.maxStoresDisplay, cityId: this.adjacentLocationIds, regionCountryId: this.platform.country, sortByCol: 'sequence', sortingOrder: 'ASC', parentCategoryId: this.categoryId })
                            .subscribe((stores: StoreDetails[])=>{});

                        // Get Stores
                        this._locationService.getStoresDetails({pageSize: this.maxStoresDisplay, cityId: this.adjacentLocationIds, regionCountryId: this.platform.country, sortByCol: 'name', sortingOrder: 'ASC', parentCategoryId: this.categoryId })
                            .subscribe((stores: StoreDetails[])=>{});

                        // Get Featured Products
                        this._locationService.getFeaturedProducts({pageSize: this.maxProductsDisplay, regionCountryId: this.platform.country, cityId: this.adjacentLocationIds, sortByCol: 'sequence', sortingOrder: 'ASC', parentCategoryId: this.categoryId, status: ['ACTIVE', 'OUTOFSTOCK'] })
                            .subscribe((products : ProductDetails[]) => {});

                        // Get Products
                        this._locationService.getProductsDetails({pageSize: this.maxProductsDisplay, regionCountryId: this.platform.country, cityId: this.adjacentLocationIds, sortByCol: 'name', sortingOrder: 'ASC', parentCategoryId: this.categoryId, status: ['ACTIVE', 'OUTOFSTOCK'] })
                            .subscribe((products : ProductDetails[]) => {});
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
                            this.adjacentLocationIds.unshift(this.locationId);

                            // Get categories
                            this._locationService.getParentCategories({ pageSize: this.maxCategoriesDisplay, regionCountryId: this.platform.country, cityId: this.adjacentLocationIds })
                                .subscribe((category : ParentCategory[]) => {});
        
                            // Get Featured Stores
                            this._locationService.getFeaturedStores({pageSize: this.maxStoresDisplay, regionCountryId: this.platform.country, cityId: this.adjacentLocationIds, sortByCol: 'sequence', sortingOrder: 'ASC', parentCategoryId: this.categoryId })
                                .subscribe((stores : StoresDetails[]) => {});

                            // Get Stores
                            this._locationService.getStoresDetails({pageSize: this.maxStoresDisplay, cityId: this.adjacentLocationIds, regionCountryId: this.platform.country, sortByCol: 'name', sortingOrder: 'ASC', parentCategoryId: this.categoryId })
                                .subscribe((stores: StoreDetails[])=>{});
        
                            // Get Featured Products
                            this._locationService.getFeaturedProducts({pageSize: this.maxProductsDisplay, regionCountryId: this.platform.country, cityId: this.adjacentLocationIds, sortByCol: 'sequence', sortingOrder: 'ASC', parentCategoryId: this.categoryId, status: ['ACTIVE', 'OUTOFSTOCK'] })
                                .subscribe((products : ProductDetails[]) => {});

                            // Get Products
                            this._locationService.getProductsDetails({pageSize: this.maxProductsDisplay, regionCountryId: this.platform.country, cityId: this.adjacentLocationIds, sortByCol: 'name', sortingOrder: 'ASC', parentCategoryId: this.categoryId, status: ['ACTIVE', 'OUTOFSTOCK'] })
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
                    this.featuredStores = stores;                     
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Stores Pagination
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

        // Get Stores
        this._locationService.storesDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores: StoresDetails[]) => { 
                if (stores) {
                    this.stores = stores;                     
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Stores Pagination
        this._locationService.storesDetailPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) => { 
                if (pagination) {               
                    this.storesPagination = pagination;     
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Get Featured Products
        this._locationService.featuredProducts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductDetails[]) => { 
                if (products) {
                    this.featuredProducts = products;
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

        // Get Products
        this._locationService.productsDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductDetails[]) => { 
                if (products) {
                    this.products = products;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Products pagination
        this._locationService.productDetailPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) => { 
                if (pagination) {
                    this.productsPagination = pagination;              
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // once selectCart() is triggered, it will set isLoading to true
        // this function will wait for both featuredStores$ & featuredProducts$ result first
        // then is isLoading to false
        combineLatest([
            this._locationService.featuredStores$,
            this._locationService.featuredProducts$
        ]).pipe(takeUntil(this._unsubscribeAll))
        .subscribe(([featuredStores, featuredProducts ] : [StoresDetails[], ProductDetails[]])=>{
            if (featuredStores && featuredProducts) {
                this.isLoading = false;

                if (featuredStores.length === 0) {
                    // Get stores
                    this.featuredStores = this.stores;
                }

                if (featuredProducts.length === 0) {
                    // Get products
                    this.featuredProducts = this.products;
                }
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public Method
    // -----------------------------------------------------------------------------------------------------

    backClicked() {
        this._location.back();
    }
}
