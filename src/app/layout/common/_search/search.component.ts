import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations/public-api';
import { Router } from '@angular/router';
import { SearchService } from './search.service';

@Component({
    selector     : 'search',
    templateUrl  : './search.component.html',
    encapsulation: ViewEncapsulation.None,
    exportAs     : 'fuseSearch',
    animations   : fuseAnimations
})
export class _SearchComponent implements OnInit, OnDestroy
{
    @Output() search: EventEmitter<any> = new EventEmitter<any>();
    
    searchControl: FormControl = new FormControl();
    resultSets: any[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _searchService: SearchService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._searchService.get()
            .subscribe((response)=>{               
                this.resultSets = response;

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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On keydown of the search input
     *
     * @param event
     */
    onKeydown(event: KeyboardEvent): void
    {
        // Listen for escape to close the search
        // if the appearance is 'bar'

        // Escape
        if ( event.code === 'Escape' )
        {
            // Do Something
        }
        
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    goToSearch(value: string)
    {
        let now = new Date();
        let dataSearch = {
            searchText  : value,
            created     : (now.getMonth()+1).toString().padStart(2, '0') + "/" +
                          now.getDate().toString().padStart(2, '0') + "/" +
                          now.getFullYear().toString().padStart(4, '0') + " " +
                          now.getHours().toString().padStart(2, '0') + ":" +
                          now.getMinutes().toString().padStart(2, '0') + ":" +
                          now.getSeconds().toString().padStart(2, '0'),
            storeId     : null
        };
        
        let localDataSearch: any[] = JSON.parse(this._searchService.localSearch$);        

        // array empty or does not exist
        if (localDataSearch === undefined || localDataSearch.length == 0) {
            localDataSearch = [dataSearch];
        } else {
            if (localDataSearch.length > 4) {
                localDataSearch.pop();
            }
            localDataSearch.unshift(dataSearch);
        }

        this._searchService.localSearch = localDataSearch;
        this.resultSets = localDataSearch;        

        this._searchService.searchValue = value;

        this._router.navigate(['/search'], {queryParams: {keyword: value}});
    }

    selectResult(result: any, event: ElementRef) {
        this._router.navigate(['/search'], {queryParams: {keyword: result.searchText}});
    }
}
