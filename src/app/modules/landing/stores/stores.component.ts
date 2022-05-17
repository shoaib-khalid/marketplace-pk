import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets, StorePagination } from 'app/core/store/store.types';
import { Subject, takeUntil, map, merge } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';

@Component({
    selector     : 'landing-stores',
    templateUrl  : './stores.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingStoresComponent implements OnInit
{
    @ViewChild("storesPaginator", {read: MatPaginator}) private _paginator: MatPaginator;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
   
    stores: Store [] = [];
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

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _storesService: StoresService,
        private _router: Router,
    )
    {
    }

    ngOnInit(): void {

        this._platformsService.platform$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((platform: Platform) => { 

            this.platform = platform;             
            
            this._changeDetectorRef.markForCheck();

        });
        this._storesService.stores$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((stores: Store[]) => { 
            this.stores = stores; 
            
            console.log("this.stores",this.stores);
            

            this._changeDetectorRef.markForCheck();
        });

        // Get the store pagination
        this._storesService.pagination$
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
                
                return this._storesService.getStores("",0, 10, this.platform.country,this.sortName, this.sortOrder,this.searchName);
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
                        return this._storesService.getStores("",this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'], this.platform.country, this.sortName, this.sortOrder,this.searchName);
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
    
                this._storesService.getStores("", this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'], this.platform.country, this.sortName, this.sortOrder, this.searchName)
                    .subscribe(()=>{
                        // set loading to false
                        this.isLoading = false;
                    });
            }
        }
        
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
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

    chooseStore(storeDomain:string) {
        
        let slug = storeDomain.split(".")[0]
        
        this._router.navigate(['/stores/' + slug]);
        
    }
}
