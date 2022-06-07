import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { LocationService } from 'app/core/location/location.service';
import { StoresDetails } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets, StorePagination } from 'app/core/store/store.types';
import { Subject, takeUntil, map, merge } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';

@Component({
    selector     : 'landing-stores',
    templateUrl  : './store-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingStoresComponent implements OnInit
{
    @ViewChild("storesPaginator", {read: MatPaginator}) private _paginator: MatPaginator;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
   
    stores: StoresDetails [] = [];
    pagination: StorePagination;
    currentScreenSize: string[] = [];
    productViewOrientation: string = 'grid';
    searchInputControl: FormControl = new FormControl();
    searchName: string = "";
    platform: Platform;

    pageOfItems: Array<any>;
    isLoading: boolean = false;
    sortName: string = "created";
    sortOrder: 'asc' | 'desc' | '' = 'desc';
    categoryId: string;
    locationId: string;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _storesService: StoresService,
        private _router: Router,
        private _locationService: LocationService,
        private _activatedRoute: ActivatedRoute,

    )
    {
    }

    ngOnInit(): void {

        this._platformsService.platform$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((platform: Platform) => { 

            this.platform = platform;          
            
            if (this.platform) {

                
                // Get searches from url parameter 
                this._activatedRoute.queryParams.subscribe(params => {
                    this.categoryId = params.categoryId ? params.categoryId : null;
                    this.locationId = params.locationId ? params.locationId : null;

                    // Get featured stores
                    this._locationService.getFeaturedStores({pageSize: 25, regionCountryId: this.platform.country, sortByCol: 'sequence', sortingOrder: 'ASC', parentCategoryId: this.categoryId, cityId: this.locationId })
                        .subscribe((stores : StoresDetails[]) => {});

                });

            }
            
            this._changeDetectorRef.markForCheck();

        });
        this._locationService.featuredStores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores: StoresDetails[]) => { 
                this.stores = stores;             

                this._changeDetectorRef.markForCheck();
            });

        // Get the store pagination
        this._locationService.featuredStorePagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: StorePagination) => {
            
            // Update the pagination
            this.pagination = pagination;                   

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            switchMap((query) => {                    

                this.searchName = query;
                
                // set loading to true
                this.isLoading = true;
                
                return this._locationService.getFeaturedStores({ pageSize: 25, regionCountryId: this.platform.country, sortByCol: 'sequence', sortingOrder: 'ASC', parentCategoryId: this.categoryId, cityId: this.locationId });
            }),
            map(() => {
                // set loading to false
                this.isLoading = false;
            })
        )
        .subscribe();

        // collapse category to false if desktop by default, 
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                this.currentScreenSize = matchingAliases;

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('sm') )
                {
                    // this.collapseCategory = false;
                }
                else
                {
                    // this.collapseCategory = true;
                    this.productViewOrientation = 'list';
                }

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
                        return this._locationService.getFeaturedStores({page: this.pageOfItems['currentPage'] - 1, pageSize: this.pageOfItems['pageSize'], sortByCol: 'sequence', sortingOrder: 'ASC', regionCountryId: this.platform.country, parentCategoryId: this.categoryId, cityId: this.locationId });
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);
    }

    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.pageOfItems = pageOfItems;

        if( this.pagination && this.pageOfItems['currentPage']) {

            if (this.pageOfItems['currentPage'] - 1 !== this.pagination.page) {
                // set loading to true
                this.isLoading = true;
    
                this._locationService.getFeaturedStores({page: this.pageOfItems['currentPage'] - 1, pageSize: this.pageOfItems['pageSize'], sortByCol: 'sequence', sortingOrder: 'ASC', regionCountryId: this.platform.country, parentCategoryId: this.categoryId, cityId: this.locationId })
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
}
