import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Store, StoreAssets } from 'app/core/store/store.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    locations: any;
    categories: any;
    stores: any;
   
    platform: Platform;
    image: any = [];
    countryCode:string = '';


    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _storesService: StoresService,
        private _router: Router,
    )
    {
    }

    ngOnInit(): void {
        this.locations = [
            {
                capitalCity: "Kuala Lumpur",
                scene: "https://www.wallpapers13.com/wp-content/uploads/2016/07/Kuala-Lumpur-City-Centre-Panaromic-Desktop-Wallpaper-HD-resolution-2880x1620-840x525.jpg",
                ProductName: "Lizard Salad",
                productUrl: "https://cdn-www.mandatory.com/assets/uploads/2018/04/GettyImages-685100573.jpg",
                storeName: "Exotic Store"

            },
            {
                capitalCity: "George Town",
                scene: "https://c0.wallpaperflare.com/preview/258/481/240/malaysia-george-town-oldtown-old.jpg",
                ProductName: "Red Cook Cockroaches",
                productUrl: "https://tiplr.com/wp-content/uploads/2019/07/fried-grasshoppers-on-the-thai-market-closeup_v8hgnyxumte__F0000.png",
                storeName: "All-out Insects"

            },
            {
                capitalCity: "Malacca",
                scene: "https://dailytravelpill.com/wp-content/uploads/2018/08/things-to-see-and-do-melaka-malacca-7.jpg",
                ProductName: "Tuna Bamboo",
                productUrl: "https://image.shutterstock.com/image-photo/twin-tuna-on-bamboo-tray-260nw-1038296086.jpg",
                storeName: "Fish Garden"

            },
            {
                capitalCity: "Ipoh",
                scene: "https://www.pttoutdoor.com/wp-content/uploads/2020/03/Ipoh-Malaysia-header.jpg",
                ProductName: "Crocodile Lagoon",
                productUrl: "https://i.ytimg.com/vi/6DWeRaEZbJE/hqdefault.jpg",
                storeName: "CoCoMelon"
            },
            {
                capitalCity: "Johor Bharu",
                scene: "https://media.istockphoto.com/photos/johor-bahru-picture-id497342101?b=1&k=20&m=497342101&s=170667a&w=0&h=evsi-h0v4eSk5uZ-2eyD8wX1MSV7VeG2pz63fl4Xg2g=",
                ProductName: "Crispy Chicken",
                productUrl: "https://static.toiimg.com/thumb/61589069.cms?imgsize=788682&width=800&height=800",
                storeName: "Bon Apetit"

            },
            {
                capitalCity: "Kuala Terengganu",
                scene: "https://media.istockphoto.com/photos/terengganu-drawbridge-dramatic-sunset-picture-id1210927434?b=1&k=20&m=1210927434&s=170667a&w=0&h=GzObm6Saq8g-7WexakN0Ko_sanl_-RFpl_LbX7SKTEI=",
                ProductName: "Rabbit Burger",
                productUrl: "https://static.toiimg.com/thumb/61589069.cms?imgsize=788682&width=800&height=800",
                storeName: "Rabbit Garage"

            },
            {
                capitalCity: "Shah Alam",
                scene: "https://c4.wallpaperflare.com/wallpaper/644/192/852/shah-alam-blue-mosque-white-and-blue-mosque-wallpaper-preview.jpg",
                ProductName: "Yummy Worms",
                productUrl: "https://dwu32cgxelq1c.cloudfront.net/local_newspapers/sites/20/2015/07/o-GUMMY-WORMS-face_649948960.jpg",
                storeName: "Worms Posession"

            },
            {
                capitalCity: "Kuching",
                scene: "https://c4.wallpaperflare.com/wallpaper/691/1009/261/monuments-sarawak-state-legislative-assembly-malaysia-sarawak-wallpaper-preview.jpg",
                ProductName: "Super Duper Rang"

            },
            {
                capitalCity: "Kota Bharu",
                scene: "https://media.istockphoto.com/photos/sultan-ismail-petra-arch-picture-id1130828522?k=20&m=1130828522&s=612x612&w=0&h=TDuZi3GGnO8H481F4syCPtC0JF7D86GLn81xfNqaKIE=",
            },
            {
                capitalCity: "Kangar",
                scene: "https://wallpapercave.com/wp/wp3206009.jpg",
                ProductName: "Chicken Cop Kambing"

            },
            {
                capitalCity: "Kota Kinabalu",
                scene: "https://wallpaperaccess.com/full/7410506.jpg",
                ProductName: "Grill Rang"

            },
            {
                capitalCity: "Kuantan",
                scene: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Pahang_state_mosque.jpg/1280px-Pahang_state_mosque.jpg",
                ProductName: "Super Rang"

            },
            {
                capitalCity: "Alor Setar",
                scene: "https://cari-homestay.com/wp-content/uploads/2017/03/Alor-Setar-Tower.jpg",
                ProductName: "Buffalo Head"

            },
            {
                capitalCity: "Seremban",
                scene: "https://c0.wallpaperflare.com/preview/923/146/366/malaysia-seremban-canon-70d.jpg",
                ProductName: "Crispy Chicken"
            },
        ]

        this.categories = [
            {   
                name: "Automotive", 
                url: "https://i.pinimg.com/originals/91/06/02/910602979bda92b9f88144d313f52725.png",
            },
            {
                name: "Groceries", 
                url: "https://www.pngmart.com/files/7/Groceries-Transparent-Images-PNG.png",

            },
            {
                name: "Home Applience", 
                url: "https://www.pngall.com/wp-content/uploads/11/Home-Appliance-Background-PNG.png",

            },
            {
                name: "Food & Beverages", 
                url: "https://www.pngkey.com/png/full/870-8701781_western-food-png-fried-chicken.png",

            },
            {
                name: "Fruits & Vegetables", 
                url: "https://purepng.com/public/uploads/large/purepng.com-fruits-and-vegetablesfruits-vegetables-941524726984vjp58.png",

            },
            {
                name: "Electronic Devices", 
                url: "https://www.nicepng.com/png/full/246-2469083_electronic-devices-png-live-webcasting-png.png",

            },
            {
                name: "Health & Wellbeing", 
                url: "https://pngimg.com/uploads/no_drugs/no_drugs_PNG78.png",
            },
            {
                name: "Home Exercise Equipments", 
                url: "https://pngimg.com/uploads/gym_equipment/gym_equipment_PNG85.png",

            },
        ]

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

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    displayStoreLogo(storeAssets: StoreAssets[]) {
        let storeAssetsIndex = storeAssets.findIndex(item => item.assetType === 'LogoUrl');
        if (storeAssetsIndex > -1) {
            return storeAssets[storeAssetsIndex].assetUrl;
        } else {
            return 'assets/branding/symplified/logo/symplified.png'
        }
    }

    chooseStore(storeDomain:string) {
        
        let slug = storeDomain.split(".")[0]
        
        this._router.navigate(['/stores/' + slug]);
        
    }
}
