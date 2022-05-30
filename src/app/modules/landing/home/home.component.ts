import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
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
    stores: any;
   
    platform: Platform;
    image: any = [];
    countryCode:string = '';
    products: ProductOnLocation[];
    currencySymbol: string;


    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
        private _router: Router,
        private _locationService: LocationService
    )
    {
    }

    ngOnInit(): void {
        
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
        this._locationService.locations$
            .subscribe((locations) => {

                // to show only 5
                if (locations.length >= 5) {
                    const slicedArray = locations.slice(0, 5);
                    this.locations = slicedArray;
                }    
                else {
                    this.locations = locations;
                }            
                
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

            this._storesService.featuredStores$
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

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }

    chooseStore(storeDomain:string) {
        
        let slug = storeDomain.split(".")[0]
        
        this._router.navigate(['/stores/' + slug]);
        
    }

    chooseCategory(id) {
        this._router.navigate(['/category/' + id]);
    }

    redirectToProduct(url: string) {
        this._document.location.href = url;
    }
}
