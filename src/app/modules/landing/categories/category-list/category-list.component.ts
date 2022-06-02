import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { CategoryPagination, ParentCategory } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-categories',
    templateUrl  : './category-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingCategoriesComponent implements OnInit
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    
    platform: Platform;
    
    categories: ParentCategory[] = [];
    pagination: CategoryPagination;
    isLoading: boolean = false;
    pageOfItems: Array<any>;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _locationService: LocationService,
        private _router: Router,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {

        // Get Platform Data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 
                if (platform) {
                    this.platform = platform;  
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get parent categories
        this._locationService.parentCategories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: ParentCategory[]) => {
                if (categories) {
                    this.categories = categories;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        this._locationService.parentCategoriesPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: CategoryPagination) => {
                if (pagination) {
                    this.pagination = pagination;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public Method
    // -----------------------------------------------------------------------------------------------------
    
    chooseCategory(id) {
        // let index = this.storeCategories.findIndex(item => item.id === id);
        // if (index > -1) {
        //     let slug = this.storeCategories[index].name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
        // } else {
        //     console.error("Invalid category: Category not found");
        // }
        this._router.navigate(['/category/' + id]);
    }

    onChangePage(pageOfItems: Array<any>) {
        // update current page of items
        this.pageOfItems = pageOfItems;

        if(this.pagination && this.pageOfItems['currentPage']){
            if (this.pageOfItems['currentPage'] - 1 !== this.pagination.page) {
                // set loading to true
                this.isLoading = true;
                this._locationService.getParentCategories({ page: this.pageOfItems['currentPage'] - 1, pageSize: this.pageOfItems['pageSize']})
                    .subscribe((response)=>{
                        // set loading to false
                        this.isLoading = false;
                    });
            }
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
