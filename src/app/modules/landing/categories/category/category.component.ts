import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, ParentCategory, ProductOnLocation, StoresDetails } from 'app/core/location/location.types';
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
    categories: any;
    locations: LandingLocation[];
    platform: Platform;
    stores: StoresDetails[];
    categoryId: string;
    category: ParentCategory;
    products: ProductOnLocation[];

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    locationId: string;
    location: LandingLocation;
    
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
        
        // Get location when change route - this is when we pick one location
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe((responseCategory: NavigationEnd) => {
            let locationIdRouter = responseCategory.url.split("/")[3];
            if (locationIdRouter) {
                this._locationService.getFeaturedLocations({pageSize: 10, regionCountryId: 'MYS', cityId: locationIdRouter})
                    .subscribe((location : LandingLocation[]) => {                        
                    });
            }
        })

        // Get category detail
        this._locationService.getParentCategories({pageSize: 8, regionCountryId: 'MYS', cityId: this.locationId})
            .subscribe((category : ParentCategory[]) => {
                this.category = category[0];
            });

        // Get location detail - this is when we pick one location    
        if (this.locationId) {
            this._locationService.getFeaturedLocations({pageSize: 10, regionCountryId: 'MYS', cityId: this.locationId})
                .subscribe((location : LandingLocation[]) => {
                });
        }

        // Get all locations
        this._locationService.featuredLocations$
            .subscribe((locations : LandingLocation[]) => {
                this.locations = locations;
            })
            
        // Get Current selected location
        this._locationService.featuredLocation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(location => {
                this.location = location;                

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                this.platform = platform;  
                this._locationService.featuredStores$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((stores: StoresDetails[]) => { 
                        this.stores = stores;  
                        this._changeDetectorRef.markForCheck();
                    });
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

    backClicked() {
        this._location.back();
    }
}
