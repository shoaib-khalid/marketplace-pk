import { Component, OnInit } from '@angular/core';
import { StoresService } from 'app/core/store/store.service';
import { Store } from 'app/core/store/store.types';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';

@Component({
    selector       : 'banner-slider',
    templateUrl    : './banner.component.html',
    styles         : [
        `
        :host ::ng-deep .ngx-gallery-image {
            border-radius:15px !important;
        }
        
        :host ::ng-deep ngx-gallery-bullets {
            position: absolute;
            left: 20%;

            @screen sm {
                position: absolute;
                left: 10%;
            }
        }

        :host ::ng-deep .ngx-gallery-bullet.ngx-gallery-active {
            background: var(--fuse-primary) !important;
            border-radius: 15px;
            width: 40px;
        }

        :host ::ng-deep .ngx-gallery-bullet{
            background: #979797 !important;
        }
        `
    ]
})
export class BannerComponent implements OnInit
{

    imageCollection:any = [];
    galleryOptions: NgxGalleryOptions[] = [];
    galleryImages: NgxGalleryImage[] = [];
    mobileGalleryImages: NgxGalleryImage[] = [];

    store: Store = null;
    banner: any;
    
    /**
     * Constructor
     */
    constructor(
        private _storesService: StoresService
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
        this.banner = [
            {display: "assets/images/example/order-now.png"},
            {display: "assets/images/example/special-offer.png"},
            {display: "assets/images/example/discount.png"},
        ]

        console.log("this.banner",this.banner);
        
        
        // initialise gallery
        // set galleryOptions
        this.galleryOptions = [
            {
                width: '1440x',
                height: '563px',
                imageAnimation: NgxGalleryAnimation.Slide,
                imageArrowsAutoHide: true, 
                imageBullets: true,
                imageAutoPlay: true,
                imageAutoPlayInterval: 5000,
                thumbnails: false,
                preview: false
            },
            // max-width 767 Mobile configuration
            {
                breakpoint: 767,
                width: '375px',
                height: '362px',
                imageAutoPlay: true,
                imageBullets: true,
                imageAutoPlayInterval: 5000,
                thumbnails: false,
                preview: false
            }
        ];

        if(this.banner.length > 0) {
            this.galleryImages = [];
            this.mobileGalleryImages = [];
            this.banner.forEach(item => {
                this.galleryImages.push({
                    small   : '' + item.display,
                    medium  : '' + item.display,
                    big     : '' + item.display
                });
                this.mobileGalleryImages.push({
                    small   : '' + item.display,
                    medium  : '' + item.display,
                    big     : '' + item.display
                });
            });
        } else {
            this.galleryImages = [
                {
                    small   : '' + 'https://symplified.biz/store-assets/banner-fnb.png',
                    medium  : '' + 'https://symplified.biz/store-assets/banner-fnb.png',
                    big     : '' + 'https://symplified.biz/store-assets/banner-fnb.png'
                }
            ];
            this.mobileGalleryImages = [
                {
                    small   : '' + 'https://symplified.biz/store-assets/banner-fnb.png',
                    medium  : '' + 'https://symplified.biz/store-assets/banner-fnb.png',
                    big     : '' + 'https://symplified.biz/store-assets/banner-fnb.png'
                }
            ];
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

}
