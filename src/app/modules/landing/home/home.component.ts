import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { LocationService } from 'app/core/location/location.service';
import { ParentCategory, ProductOnLocation, ProductOnLocationPagination, LandingLocation } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets } from 'app/core/store/store.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    locations: LandingLocation[];
    categories: ParentCategory[] = [];
    featuredStores: any;
   
    platform: Platform;
    image: any = [];
    countryCode:string = '';
    products: ProductOnLocation[];
    currencySymbol: string;
    mobileView: boolean = false;


    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
        private _router: Router,
        private _locationService: LocationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,

    )
    {
    }

    ngOnInit(): void {

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {               

                if ( matchingAliases.includes('lg') ) {
                } else if ( matchingAliases.includes('md') ) {

                } else if ( matchingAliases.includes('sm') ) {
                    this.mobileView = false;
                } else {
                    this.mobileView = true;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Set currency symbol
        this._platformsService.getCurrencySymbol$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(currency => this.currencySymbol = currency)

        // Get parent categories
        this._locationService.parentCategories$
            .subscribe((categories: ParentCategory[]) => {
                this.categories = categories;
            })

        // Get locations
        this._locationService.getLocations(0, this.mobileView ? 5 : 10, 'cityId', 'asc')
            .subscribe((locations) => {

                // // to show only 5
                // if (locations.length >= 5) {
                //     const slicedArray = locations.slice(0, 5);
                //     this.locations = slicedArray;
                // }    
                // else {
                //     this.locations = locations;
                // }            
                this.locations = locations;
                
            })    

        // Get products
        this._locationService.getLocationBasedProducts(0, 5, 'name', 'asc', 'Subang Jaya')
        .subscribe((response : ProductOnLocation[]) => {
            this.products = response;
        } )

        this._platformsService.platform$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((platform: Platform) => { 

            this.platform = platform;  

            // Get featured stores
            this._locationService.getFeaturedStores(0, 15, platform.country)
            .subscribe((stores) => {
                
                this.featuredStores = stores;  
            })  
    
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

    chooseCategory(id) {
        this._router.navigate(['/category/' + id]);
    }

    redirectToProduct(url: string) {
        this._document.location.href = url;
    }
}
