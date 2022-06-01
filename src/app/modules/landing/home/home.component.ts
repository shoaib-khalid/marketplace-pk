import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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
    @ViewChild("storesPaginator", {read: MatPaginator}) private _storesPaginator: MatPaginator;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    locations: LandingLocation[];
    categories: ParentCategory[] = [];
    featuredStores: any;
    featuredStoresPagination: any;
   
    platform: Platform;
    image: any = [];
    countryCode:string = '';
    products: ProductOnLocation[];
    mobileView: boolean = false;


    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _locationService: LocationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
    )
    {
    }

    ngOnInit(): void {

        this._locationService.locations$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((locations) => {
                this.locations = locations;
                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get parent categories
        this._locationService.parentCategories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: ParentCategory[]) => {
                
                // to show only 8
                if (categories.length >= 8) {
                    const slicedArray = categories.slice(0, 8);
                    this.categories = slicedArray;
                }
                else {
                    this.categories = categories;
                }
                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get featured stores
        this._locationService.featuredStores$
        .subscribe((stores) => {
            
            this.featuredStores = stores;  
        });

        // Get featured stores
        this._locationService.featuredStorePagination$
        .subscribe((storesPagination) => {
            
            this.featuredStoresPagination = storesPagination;  
        });

        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 

                this.platform = platform;  
        
                this._changeDetectorRef.markForCheck();
            });

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
