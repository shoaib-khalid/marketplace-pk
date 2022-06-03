import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, ParentCategory, ProductDetails, StoresDetails } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';

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
    
    stores: StoresDetails[] = [];
    products: ProductDetails[] = [];
    
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

        // Get parent category by Id when change route - this is when we pick the category
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe((responseLocation: NavigationEnd) => {
            if (responseLocation) {
                this.categoryId = responseLocation.url.split("/")[3];
                if (this.categoryId) {
                    // Catagory is Changed
                    this._locationService.getParentCategories({ pageSize: 8, regionCountryId: this.platform.country, cityId: this.locationId, parentCategoryId: this.categoryId })
                        .subscribe((category : ParentCategory[]) => {});
                }

                // Get Featured Stores
                this._locationService.getFeaturedStores({pageSize: 5, regionCountryId: this.platform.country, cityId: this.locationId, parentCategoryId: this.categoryId})
                    .subscribe(()=>{});

                // Get featured products
                // this._locationService.getFeaturedProducts({pageSize: 9, regionCountryId: this.platform.country, cityId: locationIdRouter, parentCategoryId: this.categoryId })
                //     .subscribe((products : ProductDetails[]) => {
                //     });
            }
        });

        // Get Platform Data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                if (platform) {
                    this.platform = platform;

                    // Get url locationId 
                    this._locationService.getFeaturedLocations({cityId: this.locationId, regionCountryId: this.platform.country})
                        .subscribe((location : LandingLocation[]) => {});

                    // Get url parentCategoryId
                    if (this.categoryId) {
                        this._locationService.getParentCategories({ pageSize: 8, cityId: this.locationId, regionCountryId: this.platform.country, parentCategoryId: this.categoryId})
                            .subscribe((category : ParentCategory[]) => {});
                    }

                    // Get categories
                    if (this.categories.length < 1) {
                        this._locationService.getParentCategories({ pageSize: 8, cityId: this.locationId, regionCountryId: this.platform.country })
                            .subscribe((category : ParentCategory[]) => {});
                    }

                    // Get Featured Stores
                    this._locationService.getFeaturedStores({pageSize: 5, cityId: this.locationId, regionCountryId: this.platform.country})
                        .subscribe(()=>{});

                    // Get featured products
                    // this._locationService.getFeaturedProducts({pageSize: 9, regionCountryId: this.platform.country, cityId: this.locationId, parentCategoryId: this.categoryId })
                    //     .subscribe((products : ProductDetails[]) => {
                    //     });
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
                    // to show only 8
                    this.categories = (categories.length >= 8) ? categories.slice(0, 8) : categories;
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
                this.stores = stores;  
                this._changeDetectorRef.markForCheck();
            });

        // Get Featured Products
        this._locationService.featuredProducts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductDetails[]) => { 
                this.products = products;  
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
