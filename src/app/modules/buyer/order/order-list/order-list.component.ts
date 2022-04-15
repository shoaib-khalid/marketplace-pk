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
    orderCategories: any;
    orderSlug: string;
    
    pagination: OrderPagination;
    pageOfItems: Array<any>;

    customerAuthenticate: CustomerAuthenticate;
    regionCountryStates: any;

    filterCustNameControl: FormControl = new FormControl();
    filterCustNameControlValue: string;
    recentOrderProgress: string [] = []

    openTab: string = "NEW";
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
            { id: "HISTORY", label: "All", completionStatus: ["PAYMENT_CONFIRMED", "RECEIVED_AT_STORE", "BEING_PREPARED", "AWAITING_PICKUP", "BEING_DELIVERED", "DELIVERED_TO_CUSTOMER", "CANCELED_BY_MERCHANT"], count: 0 },
            { id: "NEW", label: "To Ship", completionStatus: ["PAYMENT_CONFIRMED", "RECEIVED_AT_STORE", "BEING_PREPARED", "AWAITING_PICKUP"], count: 0 },
            { id: "SENT_OUT", label: "Shipping", completionStatus: "BEING_DELIVERED", count: 0 },
            { id: "DELIVERED", label: "Completed", completionStatus: "DELIVERED_TO_CUSTOMER", count: 0 },
            { id: "CANCELLED", label: "Cancelled", completionStatus: "CANCELED_BY_MERCHANT", count: 0 }
        ];

        // this._orderService.ordersCountSummary$
        // .pipe(takeUntil(this._unsubscribeAll))
        // .subscribe((response) => {

        //     this.orderCountSummary = response;

        //     this._orderCountSummary.forEach((item,i) => {

        //         // if have multiple completionStatus
        //         if (Array.isArray(item.completionStatus) && item.completionStatus.length > 1) {
        //             item.completionStatus.forEach((element, j) => {
        //                 let index = this.orderCountSummary.findIndex((obj => obj.completionStatus === item.completionStatus[j]));
        //                 if (index > -1) {
        //                     this._orderCountSummary[i].count = this._orderCountSummary[i].count + this.orderCountSummary[index].count;
        //                 }
        //             });
        //         } else {
        //             let index = this.orderCountSummary.findIndex((obj => obj.completionStatus === item.completionStatus));
        //             if (index > -1) {
        //                 this._orderCountSummary[i].count = this.orderCountSummary[index].count;
        //             }
        //         }
        //     });
        // });

        console.log('this._orderCountSummary',this._orderCountSummary);
        

        this.orderCategories = [
            {
                name: "All",
                label: "All",
                completionStatus:["PAYMENT_CONFIRMED", "RECEIVED_AT_STORE", "BEING_PREPARED", "AWAITING_PICKUP", "BEING_DELIVERED", "DELIVERED_TO_CUSTOMER", "CANCELED_BY_MERCHANT"]
            },
            {
                name: "To-Ship",
                label: "To Ship",
                completionStatus:["PAYMENT_CONFIRMED", "RECEIVED_AT_STORE", "BEING_PREPARED", "AWAITING_PICKUP"]
                
            },
            {
                name: "Shipping",
                label: "Shipping",
                completionStatus:"BEING_DELIVERED"
            },
            {
                name: "Delivered",
                label: "Completed",
                completionStatus:"DELIVERED_TO_CUSTOMER"
            },
            {
                name: "Cancelled",
                label: "Cancelled",
                completionStatus:"CANCELED_BY_MERCHANT"
            },
        ]

        this.orderSlug = this.orderSlug ? this.orderSlug : this._activatedRoute.snapshot.paramMap.get('catalogue-slug');
        let index = this.orderCategories.findIndex(item => item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '') === this.orderSlug);
        this.orderCategory = (index > -1) ? this.orderCategories[index] : null;
                
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

        this._orderService.getOrdersWithDetails(this.customerAuthenticate.session.ownerId)
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

        let currentOpenTab = displayStatuses;
        
        if (displayStatuses) {
            this.recentOrderProgress
        }
        // if (displayStatuses === "PROCESS") {
        //     this.recentTransactionsTableColumns = ['bulkId', 'invoiceId', 'created', 'orderPaymentDetail.accountName', 'total', 'deliveryType', 'deliveryService', 'deliveryProvider', 'pickup', 'action'];
        // } else if (displayStatuses !== "HISTORY") {
        //     this.recentTransactionsTableColumns = ['invoiceId', 'created', 'orderPaymentDetail.accountName', 'total', 'deliveryType','deliveryService', 'deliveryProvider', 'pickup', 'action'];
        // }  else {
        //     this.recentTransactionsTableColumns = ['invoiceId', 'created', 'orderPaymentDetail.accountName', 'total', 'completionStatus', 'pickup', 'action'];
        // }

        this.tabControl.setValue(this._orderCountSummary.find(item => item.id === this.openTab).completionStatus);

        console.log('bebunn',this.tabControl);
        

        // Mark for check
        this._changeDetectorRef.markForCheck();

    }

    reload(){
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';
    }

    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.pageOfItems = pageOfItems;
        
        if (this.pageOfItems['currentPage'] - 1 !== this.pagination.page) {
            // set loading to true
            this.isLoading = true;

            this._orderService.getOrdersWithDetails(this.customerAuthenticate.session.ownerId,this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'])
                .subscribe(()=>{
                    // set loading to false
                    this.isLoading = false;
                });

        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    changeOrderDetails(value, event = null) {

        // find if categoty exists
        let index = this.orderCategories.findIndex(item => item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '') === value);
        
        // since all-product is not a real category, it will set to null
        this.orderCategory = (index > -1) ? this.orderCategories[index] : null;

        console.log('this.orderCategory',this.orderCategory);
        
        // catalogue slug will be use in url
        this.orderSlug = value;

        console.log('this.orderSlug',this.orderSlug);
        
        
        this._router.navigate(['buyer/' + value]);

        this.reload();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    redirect(pagename: string) {

        // this._route.snapshot.paramMap.get(pagename)
        this._router.navigate([window.location.href = pagename]);
    }
    
}
