import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationService } from 'app/core/location/location.service';
import { LandingLocation, ParentCategory, ProductOnLocation } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, } from 'app/core/store/store.types';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';

@Component({
    selector     : 'location',
    templateUrl  : './location.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LocationComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    categories: ParentCategory[] = [];
    // locations: { capitalCity: string; scene: string; locationId: string; }[];
    platform: Platform;
    stores: Store[];
    locationId: string;
    location: LandingLocation;
    products: ProductOnLocation[];
    currencySymbol: string;
    categoryId: string;
    category: ParentCategory;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
        private _route: ActivatedRoute,
        private _activatedRoute: ActivatedRoute,
        private _locationService: LocationService,
        private _location: Location,
        private _router: Router,

    )
    {
    }

    ngOnInit(): void {

        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            distinctUntilChanged(),
        ).subscribe((response: NavigationEnd) => {
            let categoryIdRouter = response.url.split("/")[3]

            this._locationService.getParentCategoriesById(categoryIdRouter)
                .subscribe((category : ParentCategory) => {})
        })
        
        this.locationId = this._route.snapshot.paramMap.get('location-id');
        this.categoryId = this._route.snapshot.paramMap.get('category-id');
        
        this._locationService.getParentCategoriesById(this.categoryId)
            .subscribe((category : ParentCategory) => {})

        // console.log('locationId', this.locationId);
        // console.log('categoryId', this.categoryId);

        this._locationService.parentCategory$
            .subscribe(category => {
                this.category = category;
                
                this._changeDetectorRef.markForCheck();
            })
            
        this._locationService.getLocationById(this.locationId)
            .subscribe((location : LandingLocation) => {
                this.location = location;
            })
        

        // this.categories = [
        //     {name: "Automotive", url: "https://i.pinimg.com/originals/91/06/02/910602979bda92b9f88144d313f52725.png"},
        //     {name: "Groceries", url: "https://www.pngmart.com/files/7/Groceries-Transparent-Images-PNG.png"},
        //     {name: "Home Applience", url: "https://www.pngall.com/wp-content/uploads/11/Home-Appliance-Background-PNG.png"},
        //     {name: "Food & Beverages", url: "https://www.pngkey.com/png/full/870-8701781_western-food-png-fried-chicken.png"},
        //     {name: "Fruits & Vegetables", url: "https://purepng.com/public/uploads/large/purepng.com-fruits-and-vegetablesfruits-vegetables-941524726984vjp58.png"},
        //     {name: "Electronic Devices", url: "https://www.nicepng.com/png/full/246-2469083_electronic-devices-png-live-webcasting-png.png"},
        //     {name: "Health & Wellbeing", url: "https://pngimg.com/uploads/no_drugs/no_drugs_PNG78.png"},
        //     {name: "Home Exercise Equipments", url: "https://pngimg.com/uploads/gym_equipment/gym_equipment_PNG85.png"},
        // ]

        // this.locations = [
        //     {
        //         capitalCity: "Kuala Lumpur",
        //         scene: "https://www.wallpapers13.com/wp-content/uploads/2016/07/Kuala-Lumpur-City-Centre-Panaromic-Desktop-Wallpaper-HD-resolution-2880x1620-840x525.jpg",
        //         locationId: 'kuala-lumpur'
        //     },
        //     {
        //         capitalCity: "George Town",
        //         scene: "https://c0.wallpaperflare.com/preview/258/481/240/malaysia-george-town-oldtown-old.jpg",
        //         locationId: 'george-town'
        //     },
        //     {
        //         capitalCity: "Malacca",
        //         scene: "https://dailytravelpill.com/wp-content/uploads/2018/08/things-to-see-and-do-melaka-malacca-7.jpg",
        //         locationId: 'malacca'
        //     },
        //     {
        //         capitalCity: "Ipoh",
        //         scene: "https://www.pttoutdoor.com/wp-content/uploads/2020/03/Ipoh-Malaysia-header.jpg",
        //         locationId: 'ipoh'
        //     },
        //     {
        //         capitalCity: "Johor Bharu",
        //         scene: "https://media.istockphoto.com/photos/johor-bahru-picture-id497342101?b=1&k=20&m=497342101&s=170667a&w=0&h=evsi-h0v4eSk5uZ-2eyD8wX1MSV7VeG2pz63fl4Xg2g=",
        //         locationId: 'johor-bahru'
        //     },
        //     {
        //         capitalCity: "Kuala Terengganu",
        //         scene: "https://media.istockphoto.com/photos/terengganu-drawbridge-dramatic-sunset-picture-id1210927434?b=1&k=20&m=1210927434&s=170667a&w=0&h=GzObm6Saq8g-7WexakN0Ko_sanl_-RFpl_LbX7SKTEI=",
        //         locationId: 'kuala-terengganu'
        //     },
        //     {
        //         capitalCity: "Shah Alam",
        //         scene: "https://c4.wallpaperflare.com/wallpaper/644/192/852/shah-alam-blue-mosque-white-and-blue-mosque-wallpaper-preview.jpg",
        //         locationId: 'shah-alam'
        //     },
        //     {
        //         capitalCity: "Kuching",
        //         scene: "https://c4.wallpaperflare.com/wallpaper/691/1009/261/monuments-sarawak-state-legislative-assembly-malaysia-sarawak-wallpaper-preview.jpg",
        //         locationId: 'kuching'
        //     },
        //     {
        //         capitalCity: "Kota Bharu",
        //         scene: "https://media.istockphoto.com/photos/sultan-ismail-petra-arch-picture-id1130828522?k=20&m=1130828522&s=612x612&w=0&h=TDuZi3GGnO8H481F4syCPtC0JF7D86GLn81xfNqaKIE=",
        //         locationId: 'kota-bharu'
        //     },
        //     {
        //         capitalCity: "Kangar",
        //         scene: "https://wallpapercave.com/wp/wp3206009.jpg",
        //         locationId: 'kangar'
        //     },
        //     {
        //         capitalCity: "Kota Kinabalu",
        //         scene: "https://wallpaperaccess.com/full/7410506.jpg",
        //         locationId: 'kota-kinabalu'
        //     },
        //     {
        //         capitalCity: "Kuantan",
        //         scene: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Pahang_state_mosque.jpg/1280px-Pahang_state_mosque.jpg",
        //         locationId: 'kuantan'
        //     },
        //     {
        //         capitalCity: "Alor Setar",
        //         scene: "https://cari-homestay.com/wp-content/uploads/2017/03/Alor-Setar-Tower.jpg",
        //         locationId: 'alor-setar'
        //     },
        //     {
        //         capitalCity: "Seremban",
        //         scene: "https://c0.wallpaperflare.com/preview/923/146/366/malaysia-seremban-canon-70d.jpg",
        //         locationId: 'seremban'
        //     },
        // ]

        // set currency symbol
        this._platformsService.getCurrencySymbol$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(currency => this.currencySymbol = currency)
            
        this._locationService.getLocationBasedProducts(0, 5, 'name', 'asc', 'Subang Jaya')
        .subscribe((response : ProductOnLocation[]) => {
            this.products = response;
        } )

        this._locationService.getParentCategories('Subang Jaya')
            .subscribe((categories: ParentCategory[]) => {
                this.categories = categories;
            })

        this._platformsService.platform$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((platform: Platform) => { 

            this.platform = platform;  

            this._storesService.featuredStores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores: Store[]) => { 
                this.stores = stores;  
                
                this._changeDetectorRef.markForCheck();
    
            });
    
            
            this._changeDetectorRef.markForCheck();

        });

    }
    getHeaderTitle(root: ActivatedRoute): any {
        throw new Error('Method not implemented.');
    }

    backClicked() {
        this._location.back();
    }
}
