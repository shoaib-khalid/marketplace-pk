import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
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


    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
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
    }
}
