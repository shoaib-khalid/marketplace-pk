import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, ParentCategory, ProductDetails, ProductOnLocation, StoresDetails } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, } from 'app/core/store/store.types';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { DOCUMENT, Location } from '@angular/common';

@Component({
    selector     : 'location',
    templateUrl  : './location.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LocationComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    categories: ParentCategory[] = [];
    // locations: { capitalCity: string; scene: string; locationId: string; }[];
    platform: Platform;
    stores: StoresDetails[];
    locationId: string;
    location: LandingLocation;
    products: ProductOnLocation[];
    categoryId: string;
    category: ParentCategory;

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

    ngOnInit(): void {

        this.locationId = this._route.snapshot.paramMap.get('location-id');
        this.categoryId = this._route.snapshot.paramMap.get('category-id');

        // Get parent category by Id when change route - this is when we pick the category
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe((responseLocation: NavigationEnd) => {
            this.categoryId = responseLocation.url.split("/")[3];
            if (this.categoryId) {
                this._locationService.getParentCategories({ pageSize: 8, cityId: this.locationId, regionCountryId: this.platform.country, parentCategoryId: this.categoryId })
                    .subscribe((category : ParentCategory[]) => {});
            }
        });

        // Get Platform Data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                if (platform) {
                    this.platform = platform;

                    // Get url locationId 
                    this._locationService.getLocations({cityId: this.locationId, regionCountryId: this.platform.country})
                        .subscribe((location : LandingLocation[]) => {});

                    // Get url parentCategoryId
                    if (this.categoryId) {
                        this._locationService.getParentCategories({ pageSize: 8, cityId: this.locationId, regionCountryId: this.platform.country, parentCategoryId: this.categoryId})
                            .subscribe((category : ParentCategory[]) => {});
                    }

                    // Get Featured Stores
                    this._locationService.getStoresDetails({pageSize: 5, cityId: this.locationId, regionCountryId: this.platform.country})
                        .subscribe(()=>{});

                    // Get Featured Products
                    this._locationService.getProductsDetails({pageSize: 5, cityId: this.locationId, regionCountryId: this.platform.country})
                        .subscribe(()=>{});
                    
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
        this._locationService.location$
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

    getHeaderTitle(root: ActivatedRoute): any {
        throw new Error('Method not implemented.');
    }

    backClicked() {
        this._location.back();
    }
}
