import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-stores',
    templateUrl  : './stores.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingStoresComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();
   
    platform: Platform;
    image: any = [];
    countryCode:string = '';
    store: Store;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
        private _router: Router,
    )
    {
    }

    ngOnInit(): void {
        // Subscribe to platform data
        this._platformsService.platform$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((platform: Platform) => {
            if (platform) {
                this.platform = platform;
        
                this.countryCode = this.platform.country;

                this._storesService.getStoreTop(this.countryCode)
                .subscribe((response)=>{
                    this.image = response.topStoreAsset;
                    
                });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        // this._storesService.getStoreById('8913d06f-a63f-4a16-8059-2a30a517663a')
        // .subscribe((response) => {
        //     console.log("store CinemaOnline :", response);
        //     this.store = response
        // })

        this._storesService.getStoreById('8913d06f-a63f-4a16-8059-2a30a517663a')
            .subscribe((store: Store)=>{
                this.store = store;
                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    // chooseStore(id) {
    //     let index = this.storeCategories.findIndex(item => item.id === id);
    //     if (index > -1) {
    //         let slug = this.storeCategories[index].name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
    //         this._router.navigate(['/catalogue/' + slug]);
    //     } else {
    //         console.error("Invalid category: Category not found");
    //     }
    // }

    chooseStore() {
        
        let slug = this.store.domain.split('.')[0];
        this._router.navigate(['/stores/' + slug]);
        
    }
}
