import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from 'app/core/product/product.service';
import { Product } from 'app/core/product/product.types';
import { StoresService } from 'app/core/store/store.service';
import { ProductPagination, Store, StoreAssets, StoreCategory } from 'app/core/store/store.types';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import { take, of, switchMap, takeUntil, Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Platform } from 'app/core/platform/platform.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { DOCUMENT } from '@angular/common';

@Component({
    selector     : 'landing-product-details',
    templateUrl  : './product-details.component.html',
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

        :host ::ng-deep ngx-gallery {
            position: relative;
            z-index: 10;
            border-radius:15px !important;

            @screen sm {
                position: relative;
                z-index: 50;
                border-radius:15px !important;
            }
        }

        :host ::ng-deep .fa-arrow-circle-right:before {
            color: var(--fuse-primary);
            z-index: 40 !important;
        }

        :host ::ng-deep .fa-arrow-circle-left:before {
            color: var(--fuse-primary);
            z-index: 40 !important;
        }

        :host ::ng-deep .ngx-gallery-bullet.ngx-gallery-active {
            background: white !important;
            border: 2px double var(--fuse-primary) !important;
            z-index: 40 !important;
        }

        :host ::ng-deep .ngx-gallery-bullet{
            background: white !important;
            border: 2px double black !important;
            z-index: 40 !important;
        }

        :host ::ng-deep .ngx-gallery-image {
            border-radius:15px !important;
            z-index: 40 !important;
        }

        :host ::ng-deep .ngx-gallery-thumbnail {
            border-radius:15px !important;
            z-index: 40 !important;
        }

        :host ::ng-deep .ngx-gallery-preview-img {
            width: auto;
            background-color: white;
            border-radius:15px !important;
        }

        `
    ]
})
export class LandingProductDetailsComponent implements OnInit
{ 
    platform: Platform;
    storeDomain: string;

    store: Store;
    product: Product;
    products: Product[];

    quantity: number = 1;
    minQuantity: number = 1;
    maxQuantity: number = 999;

    specialInstruction: string;

    selectedProductInventory: any;
    selectedProductInventoryItems: any;

    selectedVariants: any = [];
    selectedVariant: any = [];
    selectedVariantNew: any = [];

    combos: any = [];
    selectedCombo: any = [];

    productAssets: any;
    displayedProduct: any = {
        price: 0,
        itemCode: null,
        sku: null,
        discountAmount:0,
        discountedPrice:0,
        SubTotal:0
    }

    categorySlug: string;

    imageCollection:any = [];
    galleryOptions: NgxGalleryOptions[] = [];
    galleryImages: NgxGalleryImage[] = [];
    specialInstructionForm: FormGroup;

    currentScreenSize: string[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: ProductPagination;

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _storesService: StoresService,
        private _productsService: ProductsService,
        private _platformService: PlatformService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit() {

        this._platformService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                if (platform) {
                    this.platform = platform;
                }
                // Mark for change
                this._changeDetectorRef.markForCheck();
            });

        this.specialInstructionForm = this._formBuilder.group({
            specialInstructionValue     : ['']
        });

        this.storeDomain = this._route.snapshot.paramMap.get('store-slug');             

        this._storesService.store$
        .pipe(
            take(1),
            switchMap((store : Store) => {

                this.store = store;
                
                // get product
                this._productsService.product$
                .subscribe((product: Product) => {
                    this.product = product;                

                    // ----------------------------------
                    // Get category info by category id
                    // ----------------------------------

                    if (this.product && this.product.productInventories.length > 0) {
                        
                        // this._storesService.getStoreCategoriesById(response.categoryId)
                        //     .subscribe((response: StoreCategory) => {
                        //         this.categorySlug = response.name.toLowerCase().replace(/ /g, '-').replace(/[-]+/g, '-').replace(/[^\w-]+/g, '');
                        //     });
                        
                        //Check condition if the product inventory got itemDiscount or not
                        const checkItemDiscount = this.product.productInventories.filter((x:any)=>x.itemDiscount);
                        
                        if(checkItemDiscount.length > 0){
                            //get most discount amount 
                            this.selectedProductInventory = this.product.productInventories.reduce((r, e) => (<any>r).itemDiscount.discountAmount > (<any>e).itemDiscount.discountAmount ? r : e);
                        }
                        else {
                            //get the cheapest price
                            this.selectedProductInventory = this.product.productInventories.reduce((r, e) => r.price < e.price ? r : e);
                        }
                        
                        // set initial selectedProductInventoryItems to the cheapest item
                        this.selectedProductInventoryItems = this.selectedProductInventory.productInventoryItems;

                        if (this.selectedProductInventoryItems) {
                            this.displayedProduct.price = this.selectedProductInventory.price;
                            this.displayedProduct.itemCode = this.selectedProductInventory.itemCode;
                            this.displayedProduct.sku = this.selectedProductInventory.sku;
                            this.displayedProduct.discountAmount = this.selectedProductInventory.itemDiscount ? this.selectedProductInventory.itemDiscount.discountAmount : null;
                            this.displayedProduct.discountedPrice = this.selectedProductInventory.itemDiscount ? this.selectedProductInventory.itemDiscount.discountedPrice : null;
                        } 
                        else {
                            this.displayedProduct.price = this.selectedProductInventory.price;
                            this.displayedProduct.itemCode = this.selectedProductInventory.itemCode;
                            this.displayedProduct.sku = this.selectedProductInventory.sku;
                            this.displayedProduct.discountAmount = this.selectedProductInventory.itemDiscount ? this.selectedProductInventory.itemDiscount.discountAmount : null;
                            this.displayedProduct.discountedPrice = this.selectedProductInventory.itemDiscount ? this.selectedProductInventory.itemDiscount.discountedPrice : null;
                        }

                        // ------------------
                        // Product Assets
                        // ------------------

                        this.productAssets = this.product.productAssets;

                        // first this will push all images expect the one that are currently display
                        product.productAssets.forEach( object => {
                            let _imageObject = {
                                small   : '' + object.url,
                                medium  : '' + object.url,
                                big     : '' + object.url
                            }
                            
                            if(object.itemCode != this.displayedProduct.itemCode){
                                this.imageCollection.push(_imageObject)
                            } 
                        });

                        // loop second one to push the one that are currently display in first array
                        product.productAssets.forEach( object => {
                            let _imageObject = {
                                small   : '' + object.url,
                                medium  : '' + object.url,
                                big     : '' + object.url
                            }
                            
                            if(object.itemCode == this.displayedProduct.itemCode){
                                this.imageCollection.unshift(_imageObject)
                            }
                        });
                
                        // set to galerry images
                        this.galleryImages = this.imageCollection                    
                        
                        if (this.galleryImages.length < 1) {
                            this.store.storeAssets.forEach(item => {                            
                                if(item.assetType === "LogoUrl") {
                                    this.galleryImages = [{
                                        small   : '' + item.assetUrl,
                                        medium  : '' + item.assetUrl,
                                        big     : '' + item.assetUrl
                                    }];
                                }
                            });
                        }

                        // -----------------------
                        // Product Variants
                        // -----------------------

                        // set currentVariant
                        this.selectedProductInventoryItems.forEach(item => {
                            this.selectedVariants.push(item.productVariantAvailableId)
                        });

                        // logic here is to extract current selected variant and to reconstruct new object with its string identifier 
                        // basically it create new array of object from this.product.productVariants to => this.requestParamVariant
                        let _productVariants = this.product.productVariants
                        _productVariants.map(variantBase => {
                            let _productVariantsAvailable = variantBase.productVariantsAvailable;
                            _productVariantsAvailable.forEach(element => {
                                this.selectedVariants.map(currentVariant => {
                                    if(currentVariant.indexOf(element.id) > -1){
                                        let _data = {
                                            basename: variantBase.name,
                                            variantID: element.id,
                                        }
                                        this.selectedVariant.push(_data)
                                    }
                                })

                            })
                        });

                        // -----------------------
                        // Product Combo
                        // -----------------------

                        // get product package if exists
                        if (this.product.isPackage) {
                            this._productsService.getProductPackageOptions(this.product.id)
                            .subscribe((response)=>{

                                this.combos = response["data"];
                                
                                this.combos.forEach(element => {
                                    this.selectedCombo[element.id] = [];
                                });

                            });
                        }

                        // -----------------------
                        // Create meta description for product
                        // -----------------------

                        if (this.product.description) {
                            const meta = document.createElement('meta');
                            meta.name = 'description';
                            meta.content = this.product.description;
                            document.head.appendChild(meta);
                        }
                    } else {
                        // this means there is no data in product inventory, loading the default image
                        this.galleryImages = [{
                            small   : '' + this.store.storeAsset.logoUrl,
                            medium  : '' + this.store.storeAsset.logoUrl,
                            big     : '' + this.store.storeAsset.logoUrl
                        }];
                    }
                });

                // get all products
                this._productsService.products$
                    .subscribe((products: Product[]) => {
                        // Shuffle the array
                        this.products = this.shuffle(products);
                        
                    })

                // Get the products pagination
                this._productsService.pagination$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((pagination: ProductPagination) => {
                    
                    // Update the pagination
                    this.pagination = pagination;                

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
                                
                return of(true);
            })
        ).subscribe(() => {
        });
        
        // initialise gallery
        // set galleryOptions
        this.galleryOptions = [
            {
                width: '350px',
                height: '350px',
                thumbnailsColumns: 3,
                imageAnimation: NgxGalleryAnimation.Slide,
                thumbnailsArrows: true,
                // previewDownload: true,
                imageArrowsAutoHide: true, 
                thumbnailsArrowsAutoHide: true,
                thumbnailsAutoHide: true,
                // "imageSize": "contain",
                "previewCloseOnClick": true, 
                "previewCloseOnEsc": true,
                // "thumbnailsRemainingCount": true
            },
            // max-width 767 Mobile configuration
            {
                breakpoint: 767,
                thumbnailsColumns: 0,
                thumbnails : false,
                thumbnailsArrows  : true,
                imageArrowsAutoHide : false,
                thumbnailsArrowsAutoHide: false,
                imageSwipe: true,
                imageBullets : true,
                width: '360px',
                height: '360px',
                // imagePercent: 100,
                // thumbnailsPercent: 30,
                // thumbnailsMargin: 10,
                // thumbnailMargin: 5,
            }
        ];

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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    shuffle(array) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
    }

    goToCatalogue() {
        history.back();
        // this._router.navigate(['/catalogue/'+this.categorySlug]);
    }

    // addToCart() {

    //     // Do nothing if special instruction is empty

    //     if (this.product.isNoteOptional === false && !this.specialInstructionForm.get('specialInstructionValue').value) {

    //         // this is to make the form shows 'required' error
    //         this.specialInstructionForm.get('specialInstructionValue').markAsTouched();

    //         // Mark for check
    //         this._changeDetectorRef.markForCheck();

    //         return;
    //     }

    //     // Pre-check the product inventory
    //     if (!this.selectedProductInventory) {
    //         const confirmation = this._fuseConfirmationService.open({
    //             "title": "Product Out of Stock",
    //             "message": "Sorry, the product is currently out of stock",
    //             "icon": {
    //               "show": true,
    //               "name": "heroicons_outline:exclamation",
    //               "color": "warn"
    //             },
    //             "actions": {
    //               "confirm": {
    //                 "show": true,
    //                 "label": "Ok",
    //                 "color": "warn"
    //               },
    //               "cancel": {
    //                 "show": false,
    //                 "label": "Cancel"
    //               }
    //             },
    //             "dismissible": true
    //           });

    //         return false;
    //     }

    //     // Precheck for combo
    //     if (this.product.isPackage) {
    //         let BreakException = {};
    //         try {
    //             this.combos.forEach(item => {
    //                 if (item.totalAllow !== this.selectedCombo[item.id].length) {
    //                     const confirmation = this._fuseConfirmationService.open({
    //                         "title": "Incomplete Product Combo selection",
    //                         "message": 'You need to select ' + item.totalAllow + ' item of <b>"' + item.title + '"</b>',
    //                         "icon": {
    //                           "show": true,
    //                           "name": "heroicons_outline:exclamation",
    //                           "color": "warn"
    //                         },
    //                         "actions": {
    //                           "confirm": {
    //                             "show": true,
    //                             "label": "Ok",
    //                             "color": "warn"
    //                           },
    //                           "cancel": {
    //                             "show": false,
    //                             "label": "Cancel"
    //                           }
    //                         },
    //                         "dismissible": true
    //                       });
    //                       throw BreakException;
    //                 }                 
    //             });
    //         } catch (error) {
    //             // console.error(error);
    //             return;
    //         }
    //     }

    //     const cartItemBody = {
    //         cartId: this._cartService.cartId$,
    //         itemCode: this.selectedProductInventory.itemCode,
    //         price: this.selectedProductInventory.price, // need to recheck & revisit
    //         productId: this.selectedProductInventory.productId,
    //         productPrice: this.selectedProductInventory.price, // need to recheck & revisit
    //         quantity: this.quantity,
    //         SKU: this.selectedProductInventory.sku,
    //         specialInstruction: this.specialInstructionForm.get('specialInstructionValue').value
    //     };

    //     // additinal step for product combo
    //     if(this.product.isPackage){
    //         cartItemBody["cartSubItem"] = [];
    //         // loop all combos from backend
    //         this.combos.forEach(item => {
    //             // compare it with current selected combo by user
    //             if (this.selectedCombo[item.id]) {
    //                 // loop the selected current combo
    //                 this.selectedCombo[item.id].forEach(element => {
    //                     // get productPakageOptionDetail from this.combo[].productPackageOptionDetail where it's subitem.productId == element (id in this.currentcombo array)
    //                     let productPakageOptionDetail = item.productPackageOptionDetail.find(subitem => subitem.productId === element);
    //                     if (productPakageOptionDetail){
    //                         // push to cart
    //                         cartItemBody["cartSubItem"].push(
    //                             {
    //                                 SKU: productPakageOptionDetail.productInventory[0].sku,
    //                                 productName: productPakageOptionDetail.product.name,
    //                                 productId: element,
    //                                 itemCode: productPakageOptionDetail.productInventory[0].itemCode,
    //                                 quantity: 1, // this is set to one because this is not main product quantity, this is item for selected prouct in this combo
    //                                 productPrice: 0, // this is set to zero because we don't charge differently for product combo item
    //                                 specialInstruction: this.specialInstructionForm.get('specialInstructionValue').value // we actually don't need this because this already included in main product, we'll at this later
    //                             }
    //                         );
    //                     }
    //                 });
    //             }
    //         });            
    //     }

    //     this._cartService.postCartItem(this._cartService.cartId$, cartItemBody)
    //         .subscribe(()=>{
    //             const confirmation = this._fuseConfirmationService.open({
    //                 "title": "Great!",
    //                 "message": "Item successfully added to cart",
    //                 "icon": {
    //                   "show": true,
    //                   "name": "heroicons_outline:check",
    //                   "color": "success"
    //                 },
    //                 "actions": {
    //                   "confirm": {
    //                     "show": true,
    //                     "label": "OK",
    //                     "color": "primary"
    //                   },
    //                   "cancel": {
    //                     "show": false,
    //                     "label": "Cancel"
    //                   }
    //                 },
    //                 "dismissible": true
    //               });
    //         }, (error) => {
    //             const confirmation = this._fuseConfirmationService.open({
    //                 "title": "Out of Stock!",
    //                 "message": "Sorry, this item is currently out of stock",
    //                 "icon": {
    //                   "show": true,
    //                   "name": "heroicons_outline:exclamation",
    //                   "color": "warn"
    //                 },
    //                 "actions": {
    //                   "confirm": {
    //                     "show": true,
    //                     "label": "OK",
    //                     "color": "warn"
    //                   },
    //                   "cancel": {
    //                     "show": false,
    //                     "label": "Cancel"
    //                   }
    //                 },
    //                 "dismissible": true
    //               });
    //         });
    // }

    onChangeVariant(id, type, productID){     

        this.selectedVariant.map( variant => {
            if(variant.basename == type && variant.variantID != id){
                this.selectedVariant.find( oldVariant => oldVariant.basename === type).variantID = id
            }
        });

        this.selectedVariantNew = [];
        this.selectedVariant.forEach(element => {
            this.selectedVariantNew.push(element.variantID)
        });

        this.findInventory()
    }

    findInventory() {

        let toFind = this.selectedVariantNew;
        let productArr = this.product;
        let inventories = productArr.productInventories;
        let assetsArr = productArr.productAssets;

        let flag = true;
        let selectedProductInventory;
        let productInventoryItems;
        
        for (let i = 0; i < inventories.length; i++) {
            flag=true;
            selectedProductInventory = inventories[i];

            // find the inventory items
            productInventoryItems = inventories[i]['productInventoryItems'];
            for (let j = 0; j < productInventoryItems.length; j++) {
                if(toFind.includes(productInventoryItems[j].productVariantAvailableId)){
                    continue;
                } else{
                    flag = false;
                    break;
                }
            }
            
            if(flag){

                this.selectedProductInventory = selectedProductInventory;

                this.displayedProduct.price = selectedProductInventory.price
                this.displayedProduct.itemCode = selectedProductInventory.itemCode
                this.displayedProduct.sku = selectedProductInventory.sku
                this.displayedProduct.discountAmount = selectedProductInventory.itemDiscount ? selectedProductInventory.itemDiscount.discountAmount : null;
                this.displayedProduct.discountedPrice = selectedProductInventory.itemDiscount ? selectedProductInventory.itemDiscount.discountedPrice : null;

                // reorder image collection 
                this.galleryImages = [];
                this.imageCollection = [];
                this.productAssets = assetsArr;

                // rearrange imageCollection 
                this.productAssets.forEach( object => {
                    let _imageObject = {
                        small   : '' + object.url,
                        medium  : '' + object.url,
                        big     : '' + object.url
                    }
                    
                    if(object.itemCode != this.displayedProduct.itemCode){
                        this.imageCollection.push(_imageObject)
                    }
                    
                });

                this.productAssets.forEach( object => {
                    let _imageObject = {
                        small   : '' + object.url,
                        medium  : '' + object.url,
                        big     : '' + object.url
                    }
                    
                    if(object.itemCode == this.displayedProduct.itemCode){
                        this.imageCollection.unshift(_imageObject)
                    }
                    
                });

                this.galleryImages = this.imageCollection
                if (this.galleryImages.length < 1) {
                    this.galleryImages = [{
                        small   : '' + this.store.storeAsset.logoUrl,
                        medium  : '' + this.store.storeAsset.logoUrl,
                        big     : '' + this.store.storeAsset.logoUrl
                    }];
                }
                // end of reorder image collection
            }
        }
    }

    onChangeCombo(comboId, productId , event){

        let productID = event.target.value;

        // remove only unchecked item in array
        if (event.target.checked === false) {
            let index = this.selectedCombo[comboId].indexOf(productID);
            if (index !== -1) {
                this.selectedCombo[comboId].splice(index, 1);
                return;
            }
        }

        let currentComboSetting = this.combos.find(item => item.id === comboId);
        
        // remove first item in array if it exceed totalAllow
        if (this.selectedCombo[comboId].length >= currentComboSetting.totalAllow){
            this.selectedCombo[comboId].shift();
        }

        // set currentCombo
        this.selectedCombo[comboId].push(productId);
    }

    checkQuantity(operator: string = null) {
        if (operator === 'decrement')
            this.quantity > this.minQuantity ? this.quantity -- : this.quantity = this.minQuantity;
        else if (operator === 'increment')
            this.quantity < this.maxQuantity ? this.quantity ++ : this.quantity = this.maxQuantity;
        else {
            if (this.quantity < this.minQuantity) 
                this.quantity = this.minQuantity;
            else if (this.quantity > this.maxQuantity)
                this.quantity = this.maxQuantity;
        }
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return this.platform.logo;
        }
    }

    chooseStore(storeDomain:string) {
        
        let slug = storeDomain.split(".")[0]
        
        this._router.navigate(['/store/' + slug]);
        
    }

    redirectToProduct(url: string) {
        this._document.location.href = url;
    }
}
