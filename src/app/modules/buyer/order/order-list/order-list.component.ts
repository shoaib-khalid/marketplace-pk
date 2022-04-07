import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerAuthenticate } from 'app/core/auth/auth.types';
import { CartService } from 'app/core/cart/cart.service';
import { CartItem } from 'app/core/cart/cart.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets } from 'app/core/store/store.types';
import { UserService } from 'app/core/user/user.service';
import { merge, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { OrderListService } from './order-list.service';
import { OrderDetails, OrderItemWithDetails, OrderPagination } from './order-list.type';

@Component({
    selector     : 'order-list',
    templateUrl  : './order-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class OrderListComponent implements OnInit
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    currentScreenSize: string[] = [];
    pageOfItems: Array<any>;
    pagination: OrderPagination;
    isLoading: boolean = false;

    store: Store;
    cartItems: CartItem[] = [];
    
    ordersDetails$: Observable<OrderDetails[]>;
    orderList: OrderItemWithDetails[] = [];
    orderSlug: string;

    regionCountryStates: any;

    customerAuthenticate: CustomerAuthenticate;


    /**
    * Constructor
    */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _orderService: OrderListService,
        private _router: Router,
        private _authService: AuthService,
        public _dialog: MatDialog

    )
    {
    }

    ngOnInit() :void {

        this.ordersDetails$ = this._orderService.ordersDetails$;
                
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

        this._orderService.getOrdersWithDetails(this.customerAuthenticate.session.ownerId).subscribe((response) =>{});

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


    reload(){
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';
    }

    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.pageOfItems = pageOfItems;
        
        if (this.pageOfItems['currentPage'] !== this.pagination.page) {
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
    
    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }
}
