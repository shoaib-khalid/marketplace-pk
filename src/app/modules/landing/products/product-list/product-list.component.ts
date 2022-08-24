import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, LocationArea, ProductDetailPagination, ProductDetails } from 'app/core/location/location.types';
import { NavigateService } from 'app/core/navigate-url/navigate.service';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { Subject, takeUntil, map, merge } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector     : 'landing-products',
    templateUrl  : './product-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingProductsComponent implements OnInit
{
    @ViewChild("productsPaginator", {read: MatPaginator}) private _paginator: MatPaginator;
    
    platform: Platform;

    // product detauls
    productsDetailsTitle: string = "Items";
    productsDetails: ProductDetails[] = [];
    productsDetailsPagination: ProductDetailPagination;
    productsDetailsPageOfItems: Array<any>;
    productsDetailsPageSize: number = 30;
    oldProductsDetailsPaginationIndex: number = 0;
    
    categoryId: string;
    
    locationId: string;
    location: LandingLocation;
    adjacentLocationIds: string[] = [];
    
    currentScreenSize: string[] = [];
    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _locationService: LocationService,
        private _activatedRoute: ActivatedRoute,
        private _navigate: NavigateService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        this._locationService.productsDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductDetails[]) => { 
                if (products) {
                    this.productsDetails = products;
                }
                this._changeDetectorRef.markForCheck();
            });

        // Get the product pagination
        this._locationService.productDetailPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ProductDetailPagination) => {
                // Update the pagination
                this.productsDetailsPagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Current Location
        this._locationService.featuredLocation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((location: LandingLocation) => {
                if (location) {
                    this.location = location;
                    this.productsDetailsTitle = "Discover Items Near " + location.cityDetails.name;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                this.platform = platform;
                if (this.platform) {
                    // Get searches from url parameter 
                    this._activatedRoute.queryParams.subscribe(params => {
                        this.categoryId = params.categoryId ? params.categoryId : null;
                        this.locationId = params.locationId ? params.locationId : null;

                        // get back the previous pagination page
                        // more than 2 means it won't get back the previous pagination page when navigate back from 'carts' page
                        if (this._navigate.getPreviousUrl() && this._navigate.getPreviousUrl().split("/").length > 2) {                            
                            this.oldProductsDetailsPaginationIndex = this.productsDetailsPagination ? this.productsDetailsPagination.page : 0;
                        }

                        // Get current location with locationId 
                        this._locationService.getFeaturedLocations({ pageSize: 1, regionCountryId: this.platform.country, cityId: this.locationId, sortByCol: 'sequence', sortingOrder: 'ASC' })
                            .subscribe((location : LandingLocation[]) => {});
    
                        // Get adjacent city first
                        this._locationService.getLocationArea(this.locationId)
                            .subscribe((response: LocationArea[]) => {
                                this.adjacentLocationIds = [];
                                this.adjacentLocationIds = response.map(item => {
                                    return item.storeCityId;
                                });
        
                                this.adjacentLocationIds.unshift(this.locationId);
                        
                                // Get products
                                this._locationService.getProductsDetails({ 
                                    page            : this.oldProductsDetailsPaginationIndex,
                                    pageSize        : this.productsDetailsPageSize, 
                                    regionCountryId : this.platform.country, 
                                    cityId          : this.adjacentLocationIds, 
                                    parentCategoryId: this.categoryId, 
                                    status          : ['ACTIVE', 'OUTOFSTOCK'] 
                                })
                                .subscribe((products : ProductDetails[]) => {});
                            }); 
                    });
                }
                this._changeDetectorRef.markForCheck();
            });

        // collapse category to false if desktop by default, 
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {
                this.currentScreenSize = matchingAliases;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    /**
    * After view init
    */
    ngAfterViewInit(): void
    {
        setTimeout(() => {
            if (this._paginator )
            {
                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Get products if sort or page changes
                merge(this._paginator.page).pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._locationService.getProductsDetails({
                            page            : this.productsDetailsPageOfItems['currentPage'] - 1, 
                            pageSize        : this.productsDetailsPageOfItems['pageSize'], 
                            regionCountryId : this.platform.country, 
                            parentCategoryId: this.categoryId, 
                            cityId          : this.adjacentLocationIds, 
                            status          : ['ACTIVE', 'OUTOFSTOCK'] 
                        });
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public Function
    // -----------------------------------------------------------------------------------------------------

    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.productsDetailsPageOfItems = pageOfItems;

        if( this.productsDetailsPageOfItems && this.productsDetailsPageOfItems['currentPage']) {
            if (this.productsDetailsPageOfItems['currentPage'] - 1 !== this.productsDetailsPagination.page) {
                // set loading to true
                this.isLoading = true;
    
                this._locationService.getProductsDetails({
                    page            : this.productsDetailsPageOfItems['currentPage'] - 1, 
                    pageSize        : this.productsDetailsPageOfItems['pageSize'], 
                    regionCountryId : this.platform.country, 
                    parentCategoryId: this.categoryId, 
                    cityId          : this.adjacentLocationIds, 
                    status          : ['ACTIVE', 'OUTOFSTOCK'] 
                })
                .subscribe(()=>{
                    // set loading to false
                    this.isLoading = false;
                });
            }
        }
        
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
    * 
    * This function will return display see more based on height of 
    * div container
    * 
    * @param storesDescription 
    * @returns 
    */
    displaySeeMore(storesDescription){

        var div = document.createElement("div")
        div.innerHTML = storesDescription
        div.style.width ="15rem";
        document.body.appendChild(div)

        if (div.offsetHeight > 20) {
            div.setAttribute("class","hidden")
            return true;
        } else {
            div.setAttribute("class","hidden")
            return false;
        }
    }

    scrollToTop(){        
        window.scroll({ 
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
     });
    }
}
