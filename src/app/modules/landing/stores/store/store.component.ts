import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { Cart } from 'app/core/cart/cart.types';
import { JwtService } from 'app/core/jwt/jwt.service';
import { ProductsService } from 'app/core/product/product.service';
import { Product, ProductPagination } from 'app/core/product/product.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets, StoreCategory } from 'app/core/store/store.types';
import { Subject, take, switchMap, of, Observable } from 'rxjs';
import { takeUntil, debounceTime, map } from 'rxjs/operators';
import { StoreService } from './store.service';


@Component({
    selector     : 'landing-store',
    templateUrl  : './store.component.html',
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

        /** Custom mat-checkbox theme **/

        body.light .mat-checkbox-disabled.mat-checkbox-checked .mat-checkbox-background {
            background-color: var(--fuse-primary);
        }
        
        body.light .mat-checkbox-disabled .mat-checkbox-label {
            color: black;
        }

        body.light .mat-checkbox-frame {
            border-color: var(--fuse-primary);
        }

        `
    ],
    encapsulation: ViewEncapsulation.None,
    animations     : fuseAnimations,
})
export class LandingStoreComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();
   
    storeDomain: string;

    image: any = [];
    store: Store;
    storeCategories: StoreCategory[];
    storeCategory: StoreCategory;
    catalogueSlug: string;

    cartId: string;
    currentScreenSize: string[] = [];
    collapseCategory: boolean = true;

    // product
    products$: Observable<Product[]>;
    products: Product[] = [];
    selectedProduct: Product | null = null;
    pagination: ProductPagination;
    productName: string = null;

    productViewOrientation: string = 'grid';
    oldPaginationIndex: number = 0;

    sortInputControl: FormControl = new FormControl();
    sortName: string = "name";
    sortOrder: 'asc' | 'desc' | '' = 'asc';
    searchInputControl: FormControl = new FormControl();
    searchName: string = "";

    isLoading: boolean = false;
    quantity: number = 0;
    pageOfItems: Array<any>;


    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService,
        private _productsService: ProductsService,
        private _storeService: StoreService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _jwtService: JwtService,
        private _authService: AuthService,
        private _cartService: CartService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matIconRegistry: MatIconRegistry,
        private _domSanitizer: DomSanitizer,
        private _route: ActivatedRoute,
    )
    {
        this._matIconRegistry
        .addSvgIcon('search',this._domSanitizer.bypassSecurityTrustResourceUrl('assets/layouts/fnb/icons/search.svg'))
        .addSvgIcon('block-view',this._domSanitizer.bypassSecurityTrustResourceUrl('assets/layouts/fnb/icons/block-view.svg'))
        .addSvgIcon('list-view',this._domSanitizer.bypassSecurityTrustResourceUrl('assets/layouts/fnb/icons/list-view.svg'));
    }

    ngOnInit(): void {
        this.storeDomain = this._route.snapshot.paramMap.get('store-slug');     
        
        this._storesService.getStoreByDomainName(this.storeDomain)
        .pipe(
            take(1),
            switchMap((response) => {
                // check if store id exists
                if (this._storesService.storeId$ && this._storesService.storeId$ !== null) {

                    // -----------------------
                    // Get Store Category
                    // -----------------------

                    this._storesService.getStoreCategories()
                        .subscribe((response)=>{
                            this.storeCategories = response.data.content

                            this.catalogueSlug = this.catalogueSlug ? this.catalogueSlug : this._activatedRoute.snapshot.paramMap.get('catalogue-slug');
                            let index = this.storeCategories.findIndex(item => item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '') === this.catalogueSlug);
                            this.storeCategory = (index > -1) ? this.storeCategories[index] : null;
                         
                            // we'll get the previous url, any url split by / that have length more than 3 will considered product page
                            // after user click back from product page , we'll maintain it's previous pagination 
                            if (this._storeService.getPreviousUrl() && this._storeService.getPreviousUrl().split("/").length > 3) {                            
                                this.oldPaginationIndex = this.pagination ? this.pagination.page : 0;
                            }
                            
                            this._productsService.getProducts(this.oldPaginationIndex, 12, "name", "asc", "", 'ACTIVE,OUTOFSTOCK', this.storeCategory ? this.storeCategory.id : '')
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe(()=>{
                                    // set loading to false
                                    this.isLoading = false;

                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                            
                        });

                    // -----------------------
                    // check if cart id exists
                    // -----------------------

                    if (this._cartService.cartId$) {
                        
                        this.cartId = this._cartService.cartId$;
                        // if(this.cartId && this.cartId !== '') {                            
                        //     this.getCartItems(this.cartId);
                        // }
                        
                    } else {

                        let customerId = this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid ? this._jwtService.getJwtPayload(this._authService.jwtAccessToken).uid : null

                        const createCartBody = {
                            customerId: customerId, 
                            storeId: this._storesService.storeId$,
                        }
                        this._cartService.createCart(createCartBody)
                        .subscribe((cart: Cart)=>{
                                // set cart id
                                this.cartId = cart.id;

                                // if(this.cartId && this.cartId !== '') {
                                //     this.getCartItems(this.cartId);
                                // }
                            });
                    }

                    // -----------------------
                    // Get Store Snooze
                    // -----------------------
                    
                    this._storesService.getStoreSnooze()
                        .subscribe(() => {
                             
                        });

                // } else if (this.url.subDomainName === "symplified" && state.url.indexOf("/payment-redirect") > -1) {
                    // redirecting
                } else {
                    // this._router.navigate(['']);
                    // alert("no store id");
                    console.error("No store found");
                }

                this.store = response
                                
                return of(true);
            })
        ).subscribe(() => {
            
        });

        // Get the products
        this.products$ = this._productsService.products$;        

        // Get the products pagination
        this._productsService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ProductPagination) => {
                
                // Update the pagination
                this.pagination = pagination;                

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            switchMap((query) => {                    

                this.searchName = query;
                
                // set loading to true
                this.isLoading = true;
                
                return this._productsService.getProducts(0, 12, this.sortName, this.sortOrder, this.searchName, "ACTIVE,OUTOFSTOCK" , this.storeCategory ? this.storeCategory.id : '');
            }),
            map(() => {
                // set loading to false
                this.isLoading = false;
            })
        )
        .subscribe();

        this.sortInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {

                    if (query === "recent") {
                        this.sortName = "created";
                        this.sortOrder = "desc";
                    } else if (query === "cheapest") {
                        this.sortName = "price";
                        this.sortOrder = "asc";
                    } else if (query === "expensive") {
                        this.sortName = "price";
                        this.sortOrder = "desc";
                    } else if (query === "a-z") {
                        this.sortName = "name";
                        this.sortOrder = "asc";
                    } else if (query === "z-a") {
                        this.sortName = "name";
                        this.sortOrder = "desc";
                    } else {
                        // default to recent (same as recent)
                        this.sortName = "created";
                        this.sortOrder = "desc";
                    }
                    
                    // set loading to true
                    this.isLoading = true;

                    return this._productsService.getProducts(0, 12, this.sortName, this.sortOrder, this.searchName, "ACTIVE,OUTOFSTOCK" , this.storeCategory ? this.storeCategory.id : '');
                }),
                map(() => {
                    // set loading to false
                    this.isLoading = false;
                })
            ).subscribe();

        // collapse category to false if desktop by default, 
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                this.currentScreenSize = matchingAliases;

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('sm') )
                {
                    this.collapseCategory = false;
                }
                else
                {
                    this.collapseCategory = true;
                    this.productViewOrientation = 'list';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }); 
    }

    reload(){
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';
    }

    isProductOutOfStock(product: Product): boolean
    {
        if (product.allowOutOfStockPurchases === true) {
            return true;
        } else {
            if (product.productInventories.length > 0) {
                let productInventoryQuantities = product.productInventories.map(item => item.quantity);
                let totalProductInventoryQuantity = productInventoryQuantities.reduce((partialSum, a) => partialSum + a, 0);
    
                if (totalProductInventoryQuantity > 0) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }

    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.pageOfItems = pageOfItems;
        
        if (this.pageOfItems['currentPage'] - 1 !== this.pagination.page) {
            // set loading to true
            this.isLoading = true;

            this._productsService.getProducts(this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'], this.sortName, this.sortOrder, this.searchName, "ACTIVE,OUTOFSTOCK" , this.storeCategory ? this.storeCategory.id : '')
                .subscribe(()=>{
                    // set loading to false
                    this.isLoading = false;
                });
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    displaySeeMore(productDescription){

        var div = document.createElement("div")
        div.innerHTML = productDescription
        div.style.width ="15rem";
        document.body.appendChild(div)

        if (div.offsetHeight > 120) {
            div.setAttribute("class","hidden")
            return true;
        } else {
            div.setAttribute("class","hidden")
            return false;
        }
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }

    getCategorySlug(categoryName: string) {
        return categoryName.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
    }

    changeCatalogue(value, event = null) {

        // find if categoty exists
        let index = this.storeCategories.findIndex(item => item.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '') === value);
        // since all-product is not a real category, it will set to null
        this.storeCategory = (index > -1) ? this.storeCategories[index] : null;
        // catalogue slug will be use in url
        this.catalogueSlug = value;        
        
        this._router.navigate(['stores/' + this.storeDomain + '/' + value]);

        this.reload();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

}
