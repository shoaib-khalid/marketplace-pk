import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerAuthenticate } from 'app/core/auth/auth.types';
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cart.types';
import { Store, StoreAssets } from 'app/core/store/store.types';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { OrderListService } from './order-list.service';
import { OrderDetails, OrderItemWithDetails, OrderPagination, OrdersCountSummary } from './order-list.type';

@Component({
    selector     : 'order-list',
    templateUrl  : './order-list.component.html',
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
        `
    ]
})
export class OrderListComponent implements OnInit
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    currentScreenSize: string[] = [];
    isLoading: boolean = false;
    
    // Orders 
    ordersDetails$: Observable<OrderDetails[]>;
    orderList: OrderItemWithDetails[] = [];

    orderCategory
    orderSlug: string;
    
    pagination: OrderPagination;
    pageOfItems: Array<any>;

    customerAuthenticate: CustomerAuthenticate;
    regionCountryStates: any;

    filterCustNameControl: FormControl = new FormControl();
    filterCustNameControlValue: string;
    recentOrderProgress: string [] = []

    openTab: string = "ALL";
    _orderCountSummary: any;
    orderCountSummary: OrdersCountSummary[];
    tabControl: FormControl = new FormControl();

    /**
    * Constructor
    */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _orderService: OrderListService,
        private _router: Router,
        private _authService: AuthService,
        public _dialog: MatDialog,
        private _activatedRoute: ActivatedRoute

    )
    {
    }

    ngOnInit() :void {

        this.ordersDetails$ = this._orderService.ordersDetails$;        

        this._orderCountSummary = [
            { id: "ALL", label: "All", completionStatus: ["PAYMENT_CONFIRMED", "RECEIVED_AT_STORE", "BEING_PREPARED", "AWAITING_PICKUP", "BEING_DELIVERED", "DELIVERED_TO_CUSTOMER", "CANCELED_BY_MERCHANT"], count: 0 },
            { id: "TO_SHIP", label: "To Ship", completionStatus: ["PAYMENT_CONFIRMED", "BEING_PREPARED", "AWAITING_PICKUP"], count: 0 },            
            { id: "SENT_OUT", label: "Shipping", completionStatus: "BEING_DELIVERED", count: 0 },
            { id: "DELIVERED", label: "Delivered", completionStatus: ["DELIVERED_TO_CUSTOMER", "RECEIVED_AT_STORE"], count: 0 },
            { id: "CANCELLED", label: "Cancelled", completionStatus: "CANCELED_BY_MERCHANT", count: 0 },
        ];
                
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                this.currentScreenSize = matchingAliases;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Customer
        this._authService.customerAuthenticate$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: CustomerAuthenticate) => {
                this.customerAuthenticate = response;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.filterCustNameControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    this.filterCustNameControlValue = query;

                    return this._orderService.getOrdersWithDetails(this.customerAuthenticate.session.ownerId, 0, 10, this.tabControl.value);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();

        this._orderService.getOrdersWithDetails(this.customerAuthenticate.session.ownerId, 0, 3, this._orderCountSummary.find(item => item.id === "ALL").completionStatus)
            .subscribe((response) =>{
                
            });

        // Get the orders pagination
        this._orderService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: OrderPagination) => {
                
                // Update the pagination
                this.pagination = pagination;
                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });        

        this.tabControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    //kena ubah
                    return this._orderService.getOrdersWithDetails(this.customerAuthenticate.session.ownerId, 0, 3, this.tabControl.value);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck(); 
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
                        return this._orderService.getOrdersWithDetails(this.customerAuthenticate.session.ownerId, 0, 12);
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    toggleTabs(displayStatuses: string) {
        this.openTab = displayStatuses;

        // set current page to 1
        this.pageOfItems['currentPage'] = 1;

        this.tabControl.setValue(this._orderCountSummary.find(item => item.id === this.openTab).completionStatus);
        
        // Mark for check
        this._changeDetectorRef.markForCheck();

    }

    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.pageOfItems = pageOfItems;
        
        if(this.pagination && this.pageOfItems['currentPage']) {

            if (this.pageOfItems['currentPage'] - 1 !== this.pagination.page) {
                // set loading to true
                this.isLoading = true;
    
                this._orderService.getOrdersWithDetails(this.customerAuthenticate.session.ownerId,this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'], this.tabControl.value)
                    .subscribe(()=>{
                        // set loading to false
                        this.isLoading = false;
                    });
    
            }
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    redirect(pagename: string) {
        // this._route.snapshot.paramMap.get(pagename)
        this._router.navigate([window.location.href = pagename]);
    }
    
}
