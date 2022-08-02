import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { fuseAnimations } from '@fuse/animations/public-api';
import { Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { environment } from 'environments/environment';
import { StoresService } from 'app/core/store/store.service';
import { FuseLoadingService } from '@fuse/services/loading';



@Component({
    selector     : 'search-location',
    templateUrl  : './search-location.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    styles       : [
        `
            .mat-form-field.mat-form-field-appearance-fill.fuse-mat-emphasized-affix .mat-form-field-wrapper .mat-form-field-flex .mat-form-field-prefix, .mat-form-field.mat-form-field-appearance-fill.fuse-mat-emphasized-affix .mat-form-field-wrapper .mat-form-field-flex .mat-form-field-suffix {
                background-color: var(--fuse-primary) !important;
                border-color: var(--fuse-primary) !important;
            }
        `
    ]

})
export class _SearchLocationComponent implements OnInit, OnDestroy
{
    @Output() search: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('searchInput') public searchElement: ElementRef;
    searchControl: FormControl = new FormControl();

    platform: Platform;
    country: string;
    resultSets: any[];
    autoCompleteList: { type: string, location: string, description?: string }[] = [];
    
    currentScreenSize: string[] = [];

    loader: any;

    //get current location (hardcoded to KL first)
    currentLat  : number = null;
    currentLong : number = null;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _fuseLoadingService: FuseLoadingService,
        private _storesService: StoresService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _platformService: PlatformService,
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

        this._platformService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                if (platform) {
                    this.platform = platform;

                    this._storesService.getStoreRegionCountriesById(this.platform.country)
                        .subscribe((response)=>{
                            this.country = response.name;
                        });
                }
                // Mark for change
                this._changeDetectorRef.markForCheck();
            });

        // ----------------------
        // Fuse Media Watcher
        // ----------------------

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {               

                this.currentScreenSize = matchingAliases;                

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search control reactive form
        this.searchControl.valueChanges
            .pipe(
                debounceTime(1000),
                takeUntil(this._unsubscribeAll)
            ).subscribe(userInput => {                
                this.autoCompleteSetList(userInput + " " + this.country);
            });

        // implement google maps
        this.loader = new Loader({
            apiKey: environment.googleMapsAPIKey,
            libraries: ['places']
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
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the filtered value to an array to be displayed
     * 
     * @param input 
     */
    autoCompleteSetList(input: string) {

        // --------------------------
        // GoogleMap API
        // --------------------------
        
        this.loader.load().then(() => {

            let geocoder: google.maps.Geocoder = new google.maps.Geocoder();
            let address = input;

            geocoder.geocode({ address: address})
            .catch(error => {
                this.autoCompleteList = [{
                    type: "error",
                    location: "Location not found",
                    description: "Sorry we were unable to find your location"
                }]
            })
            .then((response: google.maps.GeocoderResponse) => {
                if (response && response.results.length > 0) {                    
                    this.autoCompleteList = response.results.map(item => {
                        if (!item.types.includes('country')) {
                            return {
                                type: "location",
                                location: item.formatted_address
                            }
                        }
                    }).filter(n => n);
                }             
            });
        });
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    /**
     * Locate current location
     */
    locateMe() {

        // show loading
        this._fuseLoadingService.show();

        // GoogleMap API
        navigator.geolocation.getCurrentPosition((position) => {
            var crd = position.coords;
            this.currentLat = crd.latitude;
            this.currentLong = crd.longitude;

            let location = {
                lat: this.currentLat,
                lng: this.currentLong,  
            };

            this.loader.load().then(() => {
                let geocoder: google.maps.Geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: location})
                .then((response) => {
                    if (response.results[0]) {
                        this.searchControl.setValue(response.results[0].formatted_address);

                        this._router.navigate(['/search'], { queryParams: location });

                        // hide loading
                        this._fuseLoadingService.hide();
                    }
                })
            });

        }, error => {
            this.autoCompleteList = [{
                type: "error",
                location: "Please allow location",
                description: "Unable to locate current address"
            }]
        });
    }

    /**
     * Select address from adress list
     * @param address 
     */
    selectResult(address: string) {

        // show loading
        this._fuseLoadingService.show();

        // GoogleMap API        
        this.loader.load().then(() => {

            let geocoder: google.maps.Geocoder = new google.maps.Geocoder();

            geocoder.geocode({ address: address})
            .then((response: google.maps.GeocoderResponse) => {
                if (response.results && response.results.length > 0) {
                    let location = {
                        lat: response.results[0].geometry.location.lat(),
                        lng: response.results[0].geometry.location.lng(),
                    }

                    this.searchControl.patchValue(address);

                    this._router.navigate(['/search'], {queryParams: location});

                    // hide loading
                    this._fuseLoadingService.hide();
                }
            });
        });
    }

    selectFirstResult() {
        // show loading
        this._fuseLoadingService.show();

        if (this.autoCompleteList && this.autoCompleteList.length > 0 && this.autoCompleteList[0].type !== "error") {
            let address = this.autoCompleteList[0].location;
            this.searchControl.patchValue(address);
            // GoogleMap API        
            this.loader.load().then(() => {
    
                let geocoder: google.maps.Geocoder = new google.maps.Geocoder();
    
                geocoder.geocode({ address: address})
                .then((response: google.maps.GeocoderResponse) => {
                    if (response.results && response.results.length > 0) {
                        let location = {
                            lat: response.results[0].geometry.location.lat(),
                            lng: response.results[0].geometry.location.lng(),
                        }
                        this._router.navigate(['/search'], {queryParams: location});

                        // hide loading
                        this._fuseLoadingService.hide();
                    }
                });
            });
        }
    }

    blurInput() {
        // Remove focus
        setTimeout(() => this.searchElement.nativeElement.blur());

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
