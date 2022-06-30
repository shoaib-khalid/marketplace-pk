import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'app/core/cart/cart.service';
import { ProductsService } from 'app/core/product/product.service';
import { StoresService } from 'app/core/store/store.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DeliveryRiderDetails, OrderDetails } from '../order-list/order-list.type';
import { OrderListService } from '../order-list/order-list.service';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerAuthenticate } from 'app/core/auth/auth.types';
import { Store } from 'app/core/store/store.types';


@Component({
    selector     : 'order-details',
    templateUrl  : './order-details.component.html',
    styles       : [
        `
        /** Custom input number **/
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type='number'] {
            -moz-appearance:textfield;
        }
      
        .custom-number-input input:focus {
          outline: none !important;
        }
      
        .custom-number-input button:focus {
          outline: none !important;
        }

        ngx-gallery {
            position: relative;
            z-index: 10;
        }
        `
    ]
})
export class OrderDetailsComponent implements OnInit
{ 
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    ordersDetails$: Observable<OrderDetails[]>;
    orderId: string;
    orderDetails: any;
    rider$: any;

    store$: Store;
    timezoneString: any;
    dateCreated: Date;
    dateUpdated: Date;

    _orderCountSummary: any;
  
    customerAuthenticate: CustomerAuthenticate;

    /**
     * Constructor
     */
    constructor(
        private _orderService: OrderListService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _authService: AuthService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _storesService: StoresService,

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit() {

        this.orderId = this._route.snapshot.paramMap.get('order-id');

        this._orderCountSummary = [
            { id: "ALL", label: "All", completionStatus: ["PAYMENT_CONFIRMED", "RECEIVED_AT_STORE", "BEING_PREPARED", "AWAITING_PICKUP", "BEING_DELIVERED", "DELIVERED_TO_CUSTOMER", "CANCELED_BY_MERCHANT"], count: 0, class: null, icon: null },
            { id: "TO_SHIP", label: "To Deliver", completionStatus: ["PAYMENT_CONFIRMED", "BEING_PREPARED", "AWAITING_PICKUP"], count: 0, class: "text-green-500 icon-size-5", icon: "heroicons_solid:clock" },            
            { id: "SENT_OUT", label: "On Delivery", completionStatus: "BEING_DELIVERED", count: 0, class: "text-green-500 icon-size-5", icon: "mat_solid:local_shipping" },
            { id: "DELIVERED", label: "Delivered", completionStatus: "DELIVERED_TO_CUSTOMER", count: 0, class: "text-green-500 icon-size-5", icon: "heroicons_solid:check-circle" },
            { id: "CANCELLED", label: "Cancelled", completionStatus: "CANCELED_BY_MERCHANT", count: 0, class: "text-red-600 icon-size-5", icon: "heroicons_solid:x-circle" },
        ];

        this.ordersDetails$ = this._orderService.ordersDetails$;

        // Get Customer
        this._authService.customerAuthenticate$
        .subscribe((response: CustomerAuthenticate) => {
            
            this.customerAuthenticate = response;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this._orderService.getOrdersWithDetails(this.customerAuthenticate.session.ownerId).subscribe((response) =>{
            
            this._orderService.getOrderById(this.orderId).subscribe((response)=>{
                this.orderDetails = response.data
                var TimezoneName = this.orderDetails.store.regionCountry.timezone;
                        
                // Generating the formatted text
                var options : any = {timeZone: TimezoneName, timeZoneName: "short"};
                var dateText = Intl.DateTimeFormat([], options).format(new Date);
                
                // Scraping the numbers we want from the text
                this.timezoneString = dateText.split(" ")[1].slice(3);
                
                // Getting the offset
                var timezoneOffset = parseInt(this.timezoneString.split(':')[0])*60;
    
                // Checking for a minutes offset and adding if appropriate
                if (this.timezoneString.includes(":")) {
                    var timezoneOffset = timezoneOffset + parseInt(this.timezoneString.split(':')[1]);
                }
    
                this.dateCreated = new Date(this.orderDetails.created);
                this.dateUpdated = new Date(this.orderDetails.updated);
    
                this.dateCreated.setHours(this.dateCreated.getHours() - (-timezoneOffset) / 60);
                this.dateUpdated.setHours(this.dateUpdated.getHours() - (-timezoneOffset) / 60);
                
            });
        });
        
        // get DeliveryRiderDetails
        this._orderService.getDeliveryRiderDetails(this.orderId)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((rider: DeliveryRiderDetails) => {

            this.rider$ = rider            
        });
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    goToCatalogue() {
        history.back();
        // this._router.navigate(['/catalogue/'+this.categorySlug]);
    }

    // redirectToProduct(storeDomain: string, seoName: string) {
    //     let domainName = storeDomain.split(".")[0]

    //     let seo = seoName.split("/")[4]        
        
    //     // this._document.location.href = url;
    //     this._router.navigate(['store/' + domainName + '/' + 'all-products/' + seo]);

    // }

    redirectToStore(storeDomain: string) {
        let domainName = storeDomain.split(".")[0]
        
        // this._document.location.href = url;
        this._router.navigate(['store/' + domainName + '/' + 'all-products' ]);

    }
    

    displayStatus(completionStatus: string) {
        let index = this._orderCountSummary.findIndex(item => item.id !== 'ALL' && item.completionStatus.includes(completionStatus));

        return index > -1 ? this._orderCountSummary[index] : null;
    }

}
