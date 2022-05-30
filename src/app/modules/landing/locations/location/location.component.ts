import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, ParentCategory, ProductOnLocation } from 'app/core/location/location.types';
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
    stores: Store[];
    locationId: string;
    location: LandingLocation;
    products: ProductOnLocation[];
    currencySymbol: string;
    categoryId: string;
    category: ParentCategory;

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
        private _route: ActivatedRoute,
        private _activatedRoute: ActivatedRoute,
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
            
            let categoryIdRouter = responseLocation.url.split("/")[3];
            if (categoryIdRouter) {
                this._locationService.getParentCategoriesById(categoryIdRouter)
                    .subscribe((category : ParentCategory) => {this._changeDetectorRef.markForCheck();});
            }
        })
        // Get parent category by Id - this is when we pick the category
        if (this.categoryId) {
            this._locationService.getParentCategoriesById(this.categoryId)
                .subscribe((category : ParentCategory) => {});

        }
        this._locationService.parentCategory$
            .subscribe(category => {
                this.category = category;
                this._changeDetectorRef.markForCheck();
            });
            
        // Get the current location    
        this._locationService.getLocationById(this.locationId)
            .subscribe((location : LandingLocation) => {
                this.location = location;

                // Get products for this location - this is for later, i guess
                // this._locationService.getLocationBasedProducts(0, 5, 'name', 'asc', location.cityDetails.name)
                // .subscribe((response : ProductOnLocation[]) => {
                //     this.products = response;
                // });

            });

        // set currency symbol
        this._platformsService.getCurrencySymbol$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(currency => this.currencySymbol = currency);
            
        // Get products for this location
        this._locationService.getLocationBasedProducts(0, 5, 'name', 'asc', 'Subang Jaya')
            .subscribe((response : ProductOnLocation[]) => {
                this.products = response;
            });

        // Get all locations
        this._locationService.getParentCategories('Subang Jaya')
            .subscribe((categories: ParentCategory[]) => {
                this.categories = categories;
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

    getHeaderTitle(root: ActivatedRoute): any {
        throw new Error('Method not implemented.');
    }

    backClicked() {
        this._location.back();
    }

        
    redirectToProduct(url: string) {
        this._document.location.href = url;
    }
}
