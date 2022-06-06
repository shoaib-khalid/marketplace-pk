import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, ParentCategory, ProductDetails, StoresDetails } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';

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

    locationId: string;
    location: LandingLocation;
    locations: LandingLocation[] = [];

    stores: StoresDetails[] = [];
    products: ProductDetails[] = [];
    
    redirectUrl: { categoryId?: string, locationId?: string }
    storesViewAll: boolean = false;
    productsViewAll: boolean = false;

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
        
        // Get location when change route - this is when we pick one location
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe((responseCategory: NavigationEnd) => {
            if (responseCategory) {
                this.locationId = responseCategory.url.split("/")[3];
                if (this.locationId) {
                    // Location is changed
                    this._locationService.getFeaturedLocations({pageSize: 10, regionCountryId: this.platform.country, cityId: this.locationId})
                        .subscribe((location : LandingLocation[]) => {                        
                        });
                }

                // Get featured stores
                this._locationService.getFeaturedStores({pageSize: 5, regionCountryId: this.platform.country, cityId: this.locationId, parentCategoryId: this.categoryId })
                    .subscribe((stores : StoresDetails[]) => {
                    });

                // Get featured products
                this._locationService.getFeaturedProducts({pageSize: 9, regionCountryId: this.platform.country, cityId: this.locationId, parentCategoryId: this.categoryId })
                    .subscribe((products : ProductDetails[]) => {
                    });
            }
        });

        // Get platform data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                if (platform) {
                    this.platform = platform;

                    // Get category detail
                    this._locationService.getParentCategories({pageSize: 8, regionCountryId: this.platform.country, cityId: this.locationId, parentCategoryId: this.categoryId })
                        .subscribe((category : ParentCategory[]) => {
                            this.category = category[0];
                        });

                    // Get location detail - this is when we pick one location    
                    if (this.locationId) {
                        this._locationService.getFeaturedLocations({pageSize: 10, regionCountryId: this.platform.country, cityId: this.locationId })
                            .subscribe((location : LandingLocation[]) => {
                            });
                    }

                    // Get locations, if there already locations, dont calll                    
                    if (this.locations.length < 1) {
                        this._locationService.getFeaturedLocations({pageSize: 10, regionCountryId: this.platform.country })
                            .subscribe((locations : LandingLocation[]) => {
                            });
                    }

                    // Get featured stores
                    this._locationService.getFeaturedStores({pageSize: 5, regionCountryId: this.platform.country, cityId: this.locationId, parentCategoryId: this.categoryId })
                        .subscribe((stores : StoresDetails[]) => {
                        });

                    // Get featured products
                    this._locationService.getFeaturedProducts({pageSize: 9, regionCountryId: this.platform.country, cityId: this.locationId, parentCategoryId: this.categoryId })
                        .subscribe((products : ProductDetails[]) => {
                        });
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

        // Get current selected location
        this._locationService.featuredLocation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(location => {
                this.location = location;                

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Storess
        this._locationService.featuredStores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores: StoresDetails[]) => { 
                if (stores) {
                    this.stores = stores;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Stores pagination
        this._locationService.featuredStorePagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) => { 
                
                if (pagination) {                    
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
