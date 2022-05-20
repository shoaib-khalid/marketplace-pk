import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { Loader } from '@googlemaps/js-api-loader';
import { AddAddressComponent } from '../add-address/add-address.component';
import { MatDialog } from '@angular/material/dialog';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Address } from '../checkout.types';
import { CheckoutService } from '../checkout.service';
import { EditAddressComponent } from '../edit-address/edit-address.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector       : 'addresses-setting',
    templateUrl    : './addresses-setting.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'addresses-setting',
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

            ::ng-deep .mat-radio-button .mat-radio-ripple{
                display: none;
            }

            .map {
                width: 50vw;
                height: 50vh;
            }
            #pac-input {
                background-color: #fff;
                font-family: Roboto;
                font-size: 15px;
                font-weight: 300;
                padding: 0 11px 0 13px;
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
export class AddressesSettingComponent implements OnInit, OnDestroy
{
    @ViewChild('notificationsOrigin') private _notificationsOrigin: MatButton;
    @ViewChild('notificationsPanel') private _notificationsPanel: TemplateRef<any>;

    notifications: Notification[];
    unreadCount: number = 0;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    currentScreenSize: string[] = [];
    customerAddresses: Address[] = [];

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

    //string interpolationdoesnt-update-on-eventListener hence need to use behaviour subject
    displayLatitude: BehaviorSubject<string> = new BehaviorSubject<string>('');
    displayLongtitude: BehaviorSubject<string> = new BehaviorSubject<string>('');

    //get current location
    currentLat:any=0;
    currentLong:any=0;

    /**
     * Constructor
     */
    constructor(
        private _checkoutService: CheckoutService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _notificationsService: NotificationsService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _dialog: MatDialog,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
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

        // Get customer Addresses
        this._checkoutService.customerAddresses$
        .subscribe((response: Address[]) => {
            
            this.customerAddresses = response            
            
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

        // Subscribe to notification changes
        this._notificationsService.notifications$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((notifications: Notification[]) => {

                // Load the notifications
                this.notifications = notifications;

                // Calculate the unread count
                this._calculateUnreadCount();

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

        // Dispose the overlay
        if ( this._overlayRef )
        {
            this._overlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the notifications panel
     */
    openPanel(): void
    {
        // Return if the notifications panel or its origin is not defined
        if ( !this._notificationsPanel || !this._notificationsOrigin )
        {
            return;
        }

        // Create the overlay if it doesn't exist
        if ( !this._overlayRef )
        {
            this._createOverlay();
        }

        // Attach the portal to the overlay
        this._overlayRef.attach(new TemplatePortal(this._notificationsPanel, this._viewContainerRef));
    }

    /**
     * Close the notifications panel
     */
    closePanel(): void
    {
        this._overlayRef.detach();
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): void
    {
        // Mark all as read
        this._notificationsService.markAllAsRead().subscribe();
    }

    /**
     * Toggle read status of the given notification
     */
    toggleRead(notification: Notification): void
    {
        // Toggle the read status
        notification.read = !notification.read;

        // Update the notification
        this._notificationsService.update(notification.id, notification).subscribe();
    }

    /**
     * Delete the given notification
     */
    delete(notification: Notification): void
    {
        // Delete the notification
        this._notificationsService.delete(notification.id).subscribe();
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

    addNewAddress() : void 
    {
    const dialogRef = this._dialog.open(
        AddAddressComponent, {
            width: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
            height: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
            maxWidth: this.currentScreenSize.includes('sm') ? 'auto' : '100vw',  
            maxHeight: this.currentScreenSize.includes('sm') ? 'auto' : '100vh',
            disableClose: true,
            });
        
        dialogRef.afterClosed().subscribe();
    }

    editAddress(addressId:string)
    {
        const dialogRef = this._dialog.open(
            EditAddressComponent, {
                width: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
                height: this.currentScreenSize.includes('sm') ? 'auto' : '100%',
                maxWidth: this.currentScreenSize.includes('sm') ? 'auto' : '100vw',  
                maxHeight: this.currentScreenSize.includes('sm') ? 'auto' : '100vh',
                disableClose: true,
                data:{ addressId:addressId }
                });                
            
        //     dialogRef.afterClosed().subscribe(result =>{
        //         if (result.valid === false) {
        //             return;
        //         }
        //     });
    }

    deleteAddress(addressId: string) {
        
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete Address',
            message: 'Are you sure you want to remove this Address ?',
            icon:{
                name:"mat_outline:delete_forever",
                color:"warn"
            },
            actions: {
                confirm: {
                    label: 'Delete',
                    color: 'warn'
                }
            }
        });
        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                
                // Delete the discount on the server
                this._checkoutService.deleteCustomerAddress(addressId).subscribe(() => {

                    // Close the details
                    // this.closeDetails();
                });
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the overlay
     */
    private _createOverlay(): void
    {
        // Create the overlay
        this._overlayRef = this._overlay.create({
            hasBackdrop     : true,
            backdropClass   : 'fuse-backdrop-on-mobile',
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                                  .flexibleConnectedTo(this._notificationsOrigin._elementRef.nativeElement)
                                  .withLockedPosition(true)
                                  .withPush(true)
                                  .withPositions([
                                      {
                                          originX : 'start',
                                          originY : 'bottom',
                                          overlayX: 'start',
                                          overlayY: 'top'
                                      },
                                      {
                                          originX : 'start',
                                          originY : 'top',
                                          overlayX: 'start',
                                          overlayY: 'bottom'
                                      },
                                      {
                                          originX : 'end',
                                          originY : 'bottom',
                                          overlayX: 'end',
                                          overlayY: 'top'
                                      },
                                      {
                                          originX : 'end',
                                          originY : 'top',
                                          overlayX: 'end',
                                          overlayY: 'bottom'
                                      }
                                  ])
        });

        // Detach the overlay from the portal on backdrop click
        this._overlayRef.backdropClick().subscribe(() => {
            this._overlayRef.detach();
        });
    }

    /**
     * Calculate the unread count
     *
     * @private
     */
    private _calculateUnreadCount(): void
    {
        let count = 0;

        if ( this.notifications && this.notifications.length )
        {
            count = this.notifications.filter(notification => !notification.read).length;
        }

        this.unreadCount = count;
    }
    
}
