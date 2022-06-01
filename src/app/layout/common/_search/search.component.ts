import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, filter, map, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations/public-api';
import { Router } from '@angular/router';
import { SearchService } from './search.service';
import { MatInput } from '@angular/material/input';

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
    @ViewChild('searchInput') public searchElement: ElementRef;
    searchControl: FormControl = new FormControl();
    resultSets: any[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    autoCompleteList: any[]
    minLength: number = 2;

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
            .subscribe((response)=> {    
                this.resultSets = response;                
                this.autoCompleteList = response;                
                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search control reactive form
        this.searchControl.valueChanges.subscribe(userInput => {
            this.autoCompleteSetList(userInput);
          })
    }

    /**
     * Set the filtered value to an array to be displayed
     * 
     * @param input 
     */
    autoCompleteSetList(input: string) {
        let resultList = this.filterSetList(input)
        this.autoCompleteList = resultList;
        
    }

    /**
     * Filter the set list based on user input
     * 
     * @param val 
     * @returns 
     */
    filterSetList(val: string) {        
        // if user input is other that string, return the initial resultSets
        if (typeof val != "string") {
            return this.resultSets;
        }
        // if user input is empty, return the initial resultSets
        if (val === '' || val === null) {
            return this.resultSets;
        }
        // if val is null, return the initial resultSets, else, do the filtering
        return val ? this.resultSets.filter(s => s.searchText.toLowerCase().indexOf(val.toLowerCase()) != -1)
            : this.resultSets;
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
    onKeypress(event: KeyboardEvent): void
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
        // Do nothing if value is empty string
        if (value === '') {
            return;
        }

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

        // to avoid 'no records' from showing after search has been done 
        // this.autoCompleteList.unshift(dataSearch);  

        this._searchService.searchValue = value;

        // Remove focus
        // this.searchControl.setValue('')
        setTimeout(() => this.searchElement.nativeElement.blur());

        // Mark for check
        this._changeDetectorRef.markForCheck();

        this._router.navigate(['/search'], {queryParams: {keyword: value}});
    }

    selectResult(result: any, event: any) {

        // Mark for check
        this._changeDetectorRef.markForCheck();
        this._router.navigate(['/search'], {queryParams: {keyword: result.searchText}});
        
    }

    blurInput() {
        // Remove focus
        setTimeout(() => this.searchElement.nativeElement.blur());

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
