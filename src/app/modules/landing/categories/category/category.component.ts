import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, ParentCategory, ProductOnLocation } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { DOCUMENT, Location } from '@angular/common';

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
    stores: Store[];
    categoryId: string;
    category: ParentCategory;
    products: ProductOnLocation[];
    currencySymbol: string;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    locationId: string;
    location: LandingLocation;
    
    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
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
                
                this._locationService.getLocationById(locationIdRouter)
                    .subscribe((location : LandingLocation) => {
                        this._changeDetectorRef.markForCheck();
                        
                    });
            }
        })
        // Get location detail - this is when we pick one location    
        if (this.locationId) {
            this._locationService.getLocationById(this.locationId)
                .subscribe((location : LandingLocation) => {
                });
            }
            
        this._locationService.location$
            .subscribe(location => {
                this.location = location;
                this._changeDetectorRef.markForCheck();
            });

        // Get category detail
        this._locationService.getParentCategoriesById(this.categoryId)
            .subscribe((category : ParentCategory) => {
                this.category = category;
            });

        // Get all locations
        this._locationService.locations$
            .subscribe((locations : LandingLocation[]) => {
                this.locations = locations;
            })
        
        // set currency symbol
        this._platformsService.getCurrencySymbol$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(currency => this.currencySymbol = currency)
            
        // Get products
        this._locationService.getLocationBasedProducts(0, 5, 'name', 'asc', 'Subang Jaya')
            .subscribe((response : ProductOnLocation[]) => {
                this.products = response;
            });

        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                this.platform = platform;  
                this._locationService.featuredStores$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((stores: Store[]) => { 
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

    
    redirectToProduct(url: string) {
        this._document.location.href = url;
    }
}
