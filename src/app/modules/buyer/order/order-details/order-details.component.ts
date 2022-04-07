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

    customerAuthenticate: CustomerAuthenticate;

    /**
     * Constructor
     */
    constructor(
        private _orderService: OrderListService,
        private _route: ActivatedRoute,
        private _authService: AuthService,
        private _changeDetectorRef: ChangeDetectorRef,

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit() {

        this.orderId = this._route.snapshot.paramMap.get('order-id');        

        this.ordersDetails$ = this._orderService.ordersDetails$;

        // Get Customer
        this._authService.customerAuthenticate$
        .subscribe((response: CustomerAuthenticate) => {
            
            this.customerAuthenticate = response;

            console.log('baboonnn', this.customerAuthenticate.session.ownerId);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this._orderService.getOrdersWithDetails(this.customerAuthenticate.session.ownerId).subscribe((response) =>{
            
            this._orderService.getOrderById(this.orderId).subscribe((response)=>{
                this.orderDetails = response.data
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

}
