import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { ParentCategory, ProductOnLocation, ProductOnLocationPagination, LandingLocation } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets } from 'app/core/store/store.types';
import { SearchService } from 'app/layout/common/_search/search.service';
import { debounceTime, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-search',
    templateUrl  : './search.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingSearchComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    locations: LandingLocation[];
    categories: ParentCategory[] = [];
    stores: Store[] = [];
   
    platform: Platform;
    image: any = [];
    countryCode:string = '';
    products: ProductOnLocation[];
    currencySymbol: string;
    searchValue: any;


    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
        private _router: Router,
        private _locationService: LocationService,
        private _searchService: SearchService,

    )
    {
    }

    ngOnInit(): void {

        // Get searches from local
        let searchValues = JSON.parse(this._searchService.localSearch$);
        this.searchValue = searchValues[0];

        // To reload this page when search on '/search' page
        this._searchService.searchControl.valueChanges
            .pipe(
                debounceTime(100),
                takeUntil(this._unsubscribeAll),
                switchMap((searchValue) => {

                     // Get stores
                    this._storesService.getStores('', 0, 5, this.platform.country, 'name', 'asc', searchValue)
                    .subscribe(() => {} )

                    // Get products
                    this._locationService.getLocationBasedProducts(0, 5, 'name', 'asc', searchValue, '', this.platform.country)
                    .subscribe((products : ProductOnLocation[]) => {
                        this.products = products;
                    } )
                    
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                                        
                    return [];
                })
                
            )
            .subscribe();
                 
        // Set currency symbol
        this._platformsService.getCurrencySymbol$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(currency => this.currencySymbol = currency)

        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                this.platform = platform;  
                if (this.platform) {
                    this._locationService.featuredStores$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((stores: Store[]) => { 
                            this.stores = stores;  
                            
                            // Get stores
                            this._storesService.getStores('', 0, 5, this.platform.country, 'name', 'asc', this.searchValue.searchText)
                            .subscribe(() => {});
                            
                            // Get products
                            this._locationService.getLocationBasedProducts(0, 5, 'name', 'asc', this.searchValue.searchText, '', this.platform.country)
                            .subscribe(() => {});
                    
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
        });


        this._storesService.stores$
            .subscribe((stores: Store[]) => {
                this.stores = stores;
            })
        this._locationService.locationProducts$
            .subscribe((products : ProductOnLocation[]) => {
                this.products = products;
            })

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

    chooseCategory(id) {
        // let index = this.storeCategories.findIndex(item => item.id === id);
        // if (index > -1) {
        //     let slug = this.storeCategories[index].name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
        // } else {
        //     console.error("Invalid category: Category not found");
        // }
        this._router.navigate(['/category/' + id]);
    }
}
