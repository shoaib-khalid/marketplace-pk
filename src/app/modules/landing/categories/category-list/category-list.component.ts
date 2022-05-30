import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { ParentCategory } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-categories',
    templateUrl  : './category-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingCategoriesComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    categories: any;
    platform: Platform;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
        private _locationService: LocationService,
        private _router: Router,

    )
    {
    }

    ngOnInit(): void {

        // Get parent categories
        this._locationService.parentCategories$
            .subscribe((categories: ParentCategory[]) => {
                this.categories = categories;
            })

        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => { 

                this.platform = platform;  
        
                this._changeDetectorRef.markForCheck();

            });

        
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
