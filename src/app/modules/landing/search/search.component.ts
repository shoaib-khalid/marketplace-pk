import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { AdsService } from 'app/core/ads/ads.service';
import { Ad } from 'app/core/ads/ads.types';
import { LocationService } from 'app/core/location/location.service';
import { ParentCategory, LandingLocation, StoresDetails, ProductDetails, ProductDetailPagination, StoresDetailPagination } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { map, merge, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-search',
    templateUrl  : './search.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingSearchComponent implements OnInit
{
    @ViewChild("storesPaginator", {read: MatPaginator}) private _storesPaginator: MatPaginator;
    @ViewChild("productsPaginator", {read: MatPaginator}) private _productsPaginator: MatPaginator;


    platform    : Platform;
    locations   : LandingLocation[] = [];
    stores      : StoresDetails[] = [];
    products    : ProductDetails[] = [];
    categories  : ParentCategory[] = [];

    searchValue: string;

    currentScreenSize: string[] = [];
    ads: Ad[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    storePagination: StoresDetailPagination;
    storePageOfItems: Array<any>;

    productPagination: ProductDetailPagination;
    productPageOfItems: Array<any>;

    isLoading: boolean;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _activatedRoute: ActivatedRoute,
        private _locationService: LocationService,
        private _adsService: AdsService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
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
                            this._locationService.getStoresDetails({ storeName: this.searchValue, pageSize: 15, regionCountryId: this.platform.country })
                                .subscribe(()=>{});

                            // Get products
                            this._locationService.getProductsDetails({ name: this.searchValue, pageSize: 15, regionCountryId: this.platform.country })
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
                if (stores){
                    this.stores = stores;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            
        // Get the store pagination
        this._locationService.storesDetailPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: StoresDetailPagination) => {
                
                // Update the pagination
                this.storePagination = pagination;                   

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
          
        // Get Products
        this._locationService.productsDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products : ProductDetails[]) => {
                if (products) {
                    this.products = products;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the product pagination
        this._locationService.productDetailPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ProductDetailPagination) => {

                // Update the pagination
                this.productPagination = pagination;                   

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get banners
        this._adsService.ads$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((ads: Ad[]) => {
                if (ads) {
                    // to show only 8
                    this.ads = ads;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // ----------------------
        // Fuse Media Watcher
        // ----------------------

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {               

                this.currentScreenSize = matchingAliases;                

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

    /**
    * After view init
    */
    ngAfterViewInit(): void
    {
        setTimeout(() => {
            if (this._storesPaginator )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._storesPaginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._locationService.getStoresDetails({ storeName: this.searchValue, page: this.storePageOfItems['currentPage'] - 1, pageSize: this.storePageOfItems['pageSize'], regionCountryId: this.platform.country});
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
            if (this._productsPaginator )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._productsPaginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._locationService.getProductsDetails({ name: this.searchValue, page: this.productPageOfItems['currentPage'] - 1, pageSize: this.productPageOfItems['pageSize'], regionCountryId: this.platform.country});
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);
    }
 
    onChangePage(pageOfItems: Array<any>, type: string) {
        
        // update current page of items
        if (type === 'store') {
            this.storePageOfItems = pageOfItems;
            if( this.storePagination && this.storePageOfItems['currentPage']) {
                if (this.storePageOfItems['currentPage'] - 1 !== this.storePagination.page) {
                    // set loading to true
                    this.isLoading = true;
        
                    this._locationService.getStoresDetails({ storeName: this.searchValue, page: this.storePageOfItems['currentPage'] - 1, pageSize: this.storePageOfItems['pageSize'], regionCountryId: this.platform.country})
                        .subscribe(()=>{
                            // set loading to false
                            this.isLoading = false;
                        });
                }
            }        
        }
        if (type === 'product') {
            // update current page of items
            this.productPageOfItems = pageOfItems;
            if( this.productPagination && this.productPageOfItems['currentPage']) {
                if (this.productPageOfItems['currentPage'] - 1 !== this.productPagination.page) {
                    // set loading to true
                    this.isLoading = true;
        
                    this._locationService.getProductsDetails({ name: this.searchValue, page: this.productPageOfItems['currentPage'] - 1, pageSize: this.productPageOfItems['pageSize'], regionCountryId: this.platform.country})
                        .subscribe(()=>{
                            // set loading to false
                            this.isLoading = false;
                        });
                }
            }
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
