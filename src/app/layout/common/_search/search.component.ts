import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, filter, map, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations/public-api';
import { Router } from '@angular/router';
import { SearchService } from './search.service';
import { MatInput } from '@angular/material/input';
import { Store, StoreAssets } from 'app/core/store/store.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { CustomerSearch } from './search.types';

@Component({
    selector     : 'search',
    templateUrl  : './search.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,

})
export class _SearchComponent implements OnInit, OnDestroy
{
    @Output() search: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('searchInput') public searchElement: ElementRef;
    @Input() storeId: string;
    @Input() store: { image: string, domain: string };
    searchControl: FormControl = new FormControl();
    resultSets: any[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    autoCompleteList: any[]
    minLength: number = 2;
    customer: User;
    custSearchResults: any[];

    placeholder = 'Search for your favorite food, categories or merchants e.g: ikan bakar'

    /**
     * Constructor
     */
    constructor(
        private _searchService: SearchService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService

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

        if (this.store) {
            this.placeholder = 'Search products'
        }

        
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User)=>{
                this.customer = user
            });

        this._searchService.get()
            .pipe(takeUntil(this._unsubscribeAll))
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

        // Set current date
        let now = new Date();
        const currentDate = now.getDate().toString().padStart(2, '0') + "-" +
                            (now.getMonth()+1).toString().padStart(2, '0') + "-" +
                            now.getFullYear().toString().padStart(4, '0') + " " +
                            now.getHours().toString().padStart(2, '0') + ":" +
                            now.getMinutes().toString().padStart(2, '0') + ":" +
                            now.getSeconds().toString().padStart(2, '0')


        // If logged in search
        if (this.customer) {

            let dataSearch = {
                created     : currentDate,
                customerId  : this.customer.id,                
                searchText  : value,
                storeId     : this.storeId ? this.storeId : null,
                domain      : this.store ? this.store.domain : null,
                image       : this.store ? this.store.image : null
            }

            this._searchService.postCustomerSearch(dataSearch)
                .pipe(
                    takeUntil(this._unsubscribeAll),
                    switchMap(() => {
                        return this._searchService.get()
                    }),
                    map((searches) => {
                        this.resultSets = searches;
                    })
                    )
                .subscribe()
        }
        // if guest search
        else {

            let localDataSearch: any[] = JSON.parse(this._searchService.localSearch$); 

            let index = localDataSearch.findIndex(x => x.searchText === value);
            
            // If the search doesn't exist in dataset, then create
            if (index < 0) {
                let dataSearch = {
                    searchText  : value,
                    created     : currentDate,
                    storeId     : this.storeId ? this.storeId : null,
                    domain      : this.store ? this.store.domain : null,
                    image       : this.store ? this.store.image : null
                };

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
            }
            // else if search already exist in local
            else {                
                this.moveResultSets(localDataSearch[index]);
            }
    
        }

        // to avoid 'no records' from showing after search has been done 
        // this.autoCompleteList.unshift(dataSearch);  

        // this._searchService.searchValue = value;

        // Remove focus
        setTimeout(() => this.searchElement.nativeElement.blur());

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Route to respective page
        if (this.store) {
            this._router.navigate(['/store/' + this.store.domain], {queryParams: {keyword: value}});
        }
        else {
            this._router.navigate(['/search'], {queryParams: {keyword: value}});
        }

    }

    selectResult(result: any) {

        this.moveResultSets(result);

        // Mark for check
        this._changeDetectorRef.markForCheck();

        if (result.domain) {
            this._router.navigate(['/store/' + result.domain], {queryParams: {keyword: result.searchText}});
        }
        else {
            this._router.navigate(['/search'], {queryParams: {keyword: result.searchText}});
        }
        
    }

    deleteGuestSelectedResult(value: string) {

        let localDataSearch: any[] = JSON.parse(this._searchService.localSearch$); 

        let index = localDataSearch.findIndex(x => x.searchText === value);
        
        if(index > -1) {
            localDataSearch.splice(index, 1);

            this._searchService.localSearch = localDataSearch;

            this.resultSets = localDataSearch;

            // Subscribe to search control reactive form
            this.searchControl.valueChanges.subscribe(userInput => {
                this.autoCompleteSetList(userInput);
            })

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    
        // Mark for check
        this._changeDetectorRef.markForCheck();
            
    }


    deleteSelectedResult(id: any) {
        if(this.customer ) {
            this._searchService.deleteCustomerSearch(id).subscribe(response => {
    
                if(response) {
                    this._searchService.get()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response)=> {   
                                            
                        // this.resultSets = response;                
                        this.autoCompleteList = response;  
                        
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
    
                }
            });
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();

    }

    blurInput() {
        // Remove focus
        setTimeout(() => this.searchElement.nativeElement.blur());

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    moveResultSets(result: any) {

        // Set current date
        let now = new Date();
        const currentDate = now.getDate().toString().padStart(2, '0') + "-" +
                            (now.getMonth()+1).toString().padStart(2, '0') + "-" +
                            now.getFullYear().toString().padStart(4, '0') + " " +
                            now.getHours().toString().padStart(2, '0') + ":" +
                            now.getMinutes().toString().padStart(2, '0') + ":" +
                            now.getSeconds().toString().padStart(2, '0')

        // If logged in search
        if (this.customer) {

            let dataSearch = {
                created     : currentDate,
                customerId  : this.customer.id,                
                searchText  : result.searchText,
                storeId     : result.storeId ? result.storeId : null,
                domain      : result.domain,
                image       : result.image
            }

            this._searchService.postCustomerSearch(dataSearch)
                .pipe(
                    takeUntil(this._unsubscribeAll),
                    switchMap(() => {
                        return this._searchService.get()
                    }),
                    map((searches) => {
                        this.resultSets = searches;
                        this.autoCompleteList = searches;

                        console.log("this.autoCompleteList", this.autoCompleteList);
                        
                        
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })
                    )
                .subscribe()
        }
        // if guest search
        else {

            let index = this.resultSets.findIndex(x => x.searchText === result.searchText);
    
            // create new set
            let now = new Date();
            let dataSearch = {
                searchText  : result.searchText,
                created     : (now.getMonth()+1).toString().padStart(2, '0') + "/" +
                              now.getDate().toString().padStart(2, '0') + "/" +
                              now.getFullYear().toString().padStart(4, '0') + " " +
                              now.getHours().toString().padStart(2, '0') + ":" +
                              now.getMinutes().toString().padStart(2, '0') + ":" +
                              now.getSeconds().toString().padStart(2, '0'),
                storeId     : result.storeId,
                domain      : result.domain,
                image       : result.image
            };
            
            let localDataSearch: any[] = JSON.parse(this._searchService.localSearch$);  
            // Remove old element
            localDataSearch.splice(index, 1);
            // Unshift new element
            localDataSearch.unshift(dataSearch);
    
            this._searchService.localSearch = localDataSearch;
            this.resultSets = localDataSearch; 
        }

        
    }
}
