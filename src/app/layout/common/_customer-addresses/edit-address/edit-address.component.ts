import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { City } from 'app/core/store/store.types';
import { Observable, ReplaySubject, BehaviorSubject, Subject, takeUntil, take } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { UserProfileValidationService } from 'app/modules/customer/user-profile/user-profile.validation.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
// import { UserProfileValidationService } from '../../user-profile.validation.service';

@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.component.html',
  styles       : [
        `
            /** Custom input number **/
            input[type='number']::-webkit-inner-spin-button,
            input[type='number']::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
            }
        
            .custom-number-input input:focus {
            outline: none !important;
            }
        
            .custom-number-input button:focus {
            outline: none !important;
            }

            .map {
                width: 50vw;
                height: 50vh;
            }
            #pac-input {
                background-color: #fff;
                font-family: 'Lato', sans-serif;
                font-size: 15px;
                font-weight: 300;
                padding: 0 11px 0 13px;
                padding-right: 150px;
                text-overflow: ellipsis;
                width: 400px;
                height: 40px;
            }
            
            #pac-input:focus {
                border-color: #4d90fe;
                padding: 5px 5px 5px 5px;
            }
            
            .pac-controls {
                padding: 5px 11px;
                display: inline-block;
            }
            
            .pac-controls label {
                font-family: Roboto;
                font-size: 13px;
                font-weight: 300;
            }
        `
    ]
})
export class EditAddressDialog implements OnInit {

    /** control for the selected bank for multi-selection */
    public regionCountryStateCities: FormControl = new FormControl();

    private _onDestroy = new Subject<void>();
    public filteredCities: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    @ViewChild('stateCitySelector') stateCitySelector: MatSelect;

    storeStateCities: string[] = [];
    storeStateCities$: Observable<City[]>;

    platform: Platform;
    addressForm: FormGroup;
    storeStates: string[] = [];

    countryName: string = '';
    countryCode: string = '';
    
    displayToogleNotDefault: boolean = false;
    isLoading: boolean = false;

    dialingCode: string;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    //------------------------
    //  For map and location
    //------------------------
    
    private map: google.maps.Map;

    @ViewChild('search')public searchElementRef!: ElementRef;
    
    location :any;

    // latitude!: any;
    // longitude!: any;
    center!: google.maps.LatLngLiteral;
    fullAddress:any='';
  
    displayLat:any;
    displayLong:any;

    //string interpolation doesn't-update-on-eventListener hence need to use behaviour subject
    displayLatitude: BehaviorSubject<string> = new BehaviorSubject<string>('');
    displayLongtitude: BehaviorSubject<string> = new BehaviorSubject<string>('');

    //get current location
    currentLat:any=0;
    currentLong:any=0;

    user: User

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<EditAddressDialog>,
        private _formBuilder: FormBuilder,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService

    ) { }

    ngOnInit(): void {

        // Create the form
        this.addressForm = this._formBuilder.group({
            id          : [''],
            customerId  : [''],
            name        : ['', Validators.required],
            email       : [''],
            address     : ['', Validators.required],
            city        : ['', Validators.required],
            country     : ['', Validators.required],
            phoneNumber : ['', [UserProfileValidationService.phonenumberValidator, Validators.maxLength(30)]],
            postCode    : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5), UserProfileValidationService.postcodeValidator]],
            state       : ['Selangor', Validators.required],
            isDefault   : ['']
        });

        this._userService.user$
        .pipe(takeUntil(this._onDestroy))
            .subscribe((result) => {
                    
                this.user = result;
                console.log('user', result);
                    
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        this.setInitialValue();

        // set initial selection
        this.regionCountryStateCities.setValue([]);
        // load the initial bank list
        // this.filteredCities.next(this.cities.slice());

        this.regionCountryStateCities.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((result) => {                
                // Get states by country Z(using symplified backend)
                this._storesService.getStoreRegionCountryStateCity(this.addressForm.get('state').value, result )
                .subscribe((response)=>{
                    // Get the products
                    this.storeStateCities$ = this._storesService.cities$;                    

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            });

        this.addressForm.get('state').valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((result) => {
                
                // Get states by country Z(using symplified backend)
                this._storesService.getStoreRegionCountryStateCity(result)
                .subscribe((response)=>{
                    // Get the products
                    this.storeStateCities$ = this._storesService.cities$;                    

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            });
         //to implement get current location first to be display if in db is null
         navigator.geolocation.getCurrentPosition((position) => {
            var crd = position.coords;
            this.currentLat = crd.latitude;
            this.currentLong= crd.longitude;            
        });              

        //======================== Insert google maps =========================
        //if db got null then we need to set the curren location so that it will display the google maps instead of hardcode the value of latitude and longitude
        
        this.displayLat = this.currentLat;
        this.displayLong = this.currentLong;

        this.displayLatitude.next(this.displayLat.toString());
        this.displayLongtitude.next(this.displayLong.toString());
        // implement google maos
        let loader = new Loader({
            apiKey: 'AIzaSyCFhf1LxbPWNQSDmxpfQlx69agW-I-xBIw',
            libraries: ['places']
            
        })

        //  hardcode value first        
        this.location = {
            lat: this.displayLat,
            lng: this.displayLong,  
        };
        
        loader.load().then(() => {
            this.map = new google.maps.Map(document.getElementById("map"), {
                center: this.location,
                zoom: 15,
                mapTypeControl:false,
                streetViewControl:false,//Removing the pegman from map
                // styles: styles,
                mapTypeId: "roadmap",
            })
    
            const initialMarker = new google.maps.Marker({
            position: this.location,
            map: this.map,
            });
    
            // Create the search box and link it to the UI element.
            const input = document.getElementById("pac-input") as HTMLInputElement;
            const searchBox = new google.maps.places.SearchBox(input);
            
            this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    
            // Bias the SearchBox results towards current map's viewport.
            this.map.addListener("bounds_changed", () => {
                searchBox.setBounds(this.map.getBounds() as google.maps.LatLngBounds);
            });
    
            //use for when user mark other location
            let markers: google.maps.Marker[] = [];
    
            // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
            searchBox.addListener("places_changed", () => {
            const places = searchBox.getPlaces();
        
                if (places.length == 0) {
                    return;
                }
        
                // Clear out the old markers.
                markers.forEach((marker) => {
                    marker.setMap(null);
                });
                markers = [];
    
                // Clear out the init markers.
                initialMarker.setMap(null);
    
                // For each place, get the icon, name and location.
                const bounds = new google.maps.LatLngBounds();
        
                places.forEach((place) => {
        
                    let coordinateStringify = JSON.stringify(place?.geometry?.location);
                    let coordinateParse = JSON.parse(coordinateStringify);
        
                    this.displayLat = coordinateParse.lat;
                    this.displayLong = coordinateParse.lng;

                    this.displayLatitude.next(coordinateParse.lat);
                    this.displayLongtitude.next(coordinateParse.lng);


                    this.location = {
                        lat: coordinateParse.lat,
                        lng: coordinateParse.lng,
                    };
        
                    this.fullAddress = place.address_components.map((data)=>data.long_name)
                
                    if (!place.geometry || !place.geometry.location) {
                        // console.info("Returned place contains no geometry");
                        return;
                    }
            
                    // const icon = {
                    //   url: place.icon as string,
                    //   size: new google.maps.Size(71, 71),
                    //   origin: new google.maps.Point(0, 0),
                    //   anchor: new google.maps.Point(17, 34),
                    //   scaledSize: new google.maps.Size(25, 25),
                    // };
        
                    // Create a marker for each place.
                    markers.push(
                        new google.maps.Marker({
                            map:this.map,
                            // icon,
                            title: place.name,
                            position: place.geometry.location,
                        })
                    );
            
                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                this.map.fitBounds(bounds);
            });
    
            // Configure the click listener.
            this.map.addListener("click", (event) => {

                //to be display coordinate
                let coordinateClickStringify = JSON.stringify(event.latLng);
                let coordinateClickParse = JSON.parse(coordinateClickStringify);
        
                this.location = {
                    lat: coordinateClickParse.lat,
                    lng: coordinateClickParse.lng,
                };
    
                // Clear out the old markers.
                markers.forEach((marker) => {
                marker.setMap(null);
                });
                markers = [];
    
                // Clear out the init markers1.
                initialMarker.setMap(null);
    
                // Create a marker for each place.
                markers.push(
                new google.maps.Marker({
                    map:this.map,
                    // icon,
                    position: event.latLng,
                })
                );
                this.displayLatitude.next(coordinateClickParse.lat);
                this.displayLongtitude.next(coordinateClickParse.lng);
            
            });
            
        });

        // Subscribe to platform data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                this.platform = platform;
            
                this.countryCode = this.platform.country;
                this.countryName = this.countryCode === 'MYS' ? 'Malaysia': 'Pakistan';

                // -------------------------
                // Set Dialing code
                // -------------------------
                
                let countryId = this.countryCode;
                switch (countryId) {
                    case 'MYS':
                        this.dialingCode = '60'
                        break;
                    case 'PAK':
                        this.dialingCode = '92'
                        break;
                    default:
                        break;
                }
                
                // Get states by country Z(using symplified backend)
                this._storesService.getStoreRegionCountryState(this.countryCode)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response)=>{
                        this.storeStates = response; 
                        
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                let symplifiedCountryStateId = this.addressForm.get('state').value;

                // Get city by state
                this._storesService.getStoreRegionCountryStateCity(symplifiedCountryStateId)
                .subscribe((response)=>{
                    // Get the products
                    this.storeStateCities$ = this._storesService.cities$;                        

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });


        if(this.data.type === "create"){
            this.addressForm.get('customerId').setValue(this.data.customerId);
            this.addressForm.get('isDefault').setValue(false);
            this.addressForm.get('country').setValue(this.countryName);
            this.addressForm.get('email').setValue(this.data.user.email);
        } else {
            this.addressForm.patchValue(this.data.customerAddress);
            this.displayToogleNotDefault = this.addressForm.get('isDefault').value === false ? true : false;
        }

    }

    updateAddress(){
        this.dialogRef.close(this.addressForm.value);
    }

    closeDialog(){
        this.dialogRef.close();
    }

    sanitizePhoneNumber(phoneNumber: string) {

        if (phoneNumber.match(/^\+?[0-9]+$/)) {

            let substring = phoneNumber.substring(0, 1)
            let countryId = this.countryCode;
            let sanitizedPhoneNo = ''
            
            if ( countryId === 'MYS' ) {
    
                     if (substring === '6') sanitizedPhoneNo = phoneNumber;
                else if (substring === '0') sanitizedPhoneNo = '6' + phoneNumber;
                else if (substring === '+') sanitizedPhoneNo = phoneNumber.substring(1);
                else                        sanitizedPhoneNo = '60' + phoneNumber;
    
            }
            else if ( countryId === 'PAK') {
    
                     if (substring === '9') sanitizedPhoneNo = phoneNumber;
                else if (substring === '2') sanitizedPhoneNo = '9' + phoneNumber;
                else if (substring === '+') sanitizedPhoneNo = phoneNumber.substring(1);
                else                        sanitizedPhoneNo = '92' + phoneNumber;
    
            }
    
            return sanitizedPhoneNo;
        }
        else {
            return phoneNumber;
        }

    }

    private setInitialValue() {
        this.filteredCities
            .pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                this.stateCitySelector.compareWith = (a: any, b: any) => a === b;
            });
    }

}
