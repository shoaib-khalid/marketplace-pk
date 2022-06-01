import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { ParentCategory, ProductOnLocation, ProductOnLocationPagination, LandingLocation, StoresDetails, ProductDetails } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoreAssets } from 'app/core/store/store.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-search',
    templateUrl  : './search.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingSearchComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    platform    : Platform;
    locations   : LandingLocation[] = [];
    stores      : StoresDetails[] = [];
    products    : ProductOnLocation[] = [];
    categories  : ParentCategory[] = [];

    searchValue: string;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _activatedRoute: ActivatedRoute,
        private _locationService: LocationService,
    )
    {
    }

    ngOnInit(): void {

        // Get platform
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                this.platform = platform;

                if (this.platform) {
                    // Get searches from url parameter 
                    this._activatedRoute.queryParams.subscribe(params => {
                        this.searchValue = params['keyword'];

                        if (this.searchValue) {
                            // Get stores
                            this._locationService.getStoresDetails(this.searchValue,0,5,"Subang Jaya",null,this.platform.country,null)
                                .subscribe(()=>{});

                            // Get products
                            this._locationService.getProductsDetails(this.searchValue,0,5,"","SubangJaya",null,this.platform.country,null)
                                .subscribe(()=>{});
                        }
                    });
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Stores
        this._locationService.storesDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores: StoresDetails[]) => {
                this.stores = stores;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
          
        // Get Products
        this._locationService.productsDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products : ProductDetails[]) => {
                this.products = products;

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
}
