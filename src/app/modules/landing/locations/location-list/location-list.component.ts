import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, LocationPagination } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { map, merge, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-locations',
    templateUrl  : './location-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingLocationsComponent implements OnInit
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    locations: LandingLocation[] = [];
    pagination: LocationPagination;

    pageOfItems: Array<any>;
    isLoading: boolean = false;
    platform: Platform;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _locationService: LocationService,
    )
    {
    }

    ngOnInit(): void {

        this._locationService.locations$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((locations: LandingLocation[]) => {

                this.locations = locations; 
                
                // Mark for check
                this._changeDetectorRef.markForCheck();           
            });

        // Get customer voucher pagination, isUsed = false 
        this._locationService.locationPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: LocationPagination) => {

                this.pagination = response; 
                
                // Mark for check
                this._changeDetectorRef.markForCheck();           
            });

        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 

                this.platform = platform;  
        
                this._changeDetectorRef.markForCheck();

            });
    }

    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.pageOfItems = pageOfItems;
        
        if(this.pagination && this.pageOfItems['currentPage']) {

            if (this.pageOfItems['currentPage'] - 1 !== this.pagination.page) {
                // set loading to true
                this.isLoading = true;
    
                this._locationService.getLocations(this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'])
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
                        return this._locationService.getLocations(0, 10);
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);
    }
}
