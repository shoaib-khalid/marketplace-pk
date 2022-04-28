import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
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
    )
    {
    }

    ngOnInit(): void {
        this.locations = [
            {
                capitalCity: "Kuala Lumpur",
                scene: "https://www.wallpapers13.com/wp-content/uploads/2016/07/Kuala-Lumpur-City-Centre-Panaromic-Desktop-Wallpaper-HD-resolution-2880x1620-840x525.jpg"
            },
            {
                capitalCity: "George Town",
                scene: "https://c0.wallpaperflare.com/preview/258/481/240/malaysia-george-town-oldtown-old.jpg"
            },
            {
                capitalCity: "Malacca",
                scene: "https://dailytravelpill.com/wp-content/uploads/2018/08/things-to-see-and-do-melaka-malacca-7.jpg"
            },
            {
                capitalCity: "Ipoh",
                scene: "https://www.pttoutdoor.com/wp-content/uploads/2020/03/Ipoh-Malaysia-header.jpg"
            },
            {
                capitalCity: "Johor Bharu",
                scene: "https://media.istockphoto.com/photos/johor-bahru-picture-id497342101?b=1&k=20&m=497342101&s=170667a&w=0&h=evsi-h0v4eSk5uZ-2eyD8wX1MSV7VeG2pz63fl4Xg2g="
            },
            {
                capitalCity: "Kuala Terengganu",
                scene: "https://media.istockphoto.com/photos/terengganu-drawbridge-dramatic-sunset-picture-id1210927434?b=1&k=20&m=1210927434&s=170667a&w=0&h=GzObm6Saq8g-7WexakN0Ko_sanl_-RFpl_LbX7SKTEI="
            },
            {
                capitalCity: "Shah Alam",
                scene: "https://c4.wallpaperflare.com/wallpaper/644/192/852/shah-alam-blue-mosque-white-and-blue-mosque-wallpaper-preview.jpg"
            },
            {
                capitalCity: "Kuching",
                scene: "https://c4.wallpaperflare.com/wallpaper/691/1009/261/monuments-sarawak-state-legislative-assembly-malaysia-sarawak-wallpaper-preview.jpg"
            },
            {
                capitalCity: "Kota Bharu",
                scene: "https://media.istockphoto.com/photos/sultan-ismail-petra-arch-picture-id1130828522?k=20&m=1130828522&s=612x612&w=0&h=TDuZi3GGnO8H481F4syCPtC0JF7D86GLn81xfNqaKIE="
            },
            {
                capitalCity: "Kangar",
                scene: "https://wallpapercave.com/wp/wp3206009.jpg"
            },
            {
                capitalCity: "Kota Kinabalu",
                scene: "https://wallpaperaccess.com/full/7410506.jpg"
            },
            {
                capitalCity: "Kuantan",
                scene: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Pahang_state_mosque.jpg/1280px-Pahang_state_mosque.jpg"
            },
            {
                capitalCity: "Alor Setar",
                scene: "https://cari-homestay.com/wp-content/uploads/2017/03/Alor-Setar-Tower.jpg"
            },
            {
                capitalCity: "Seremban",
                scene: "https://c0.wallpaperflare.com/preview/923/146/366/malaysia-seremban-canon-70d.jpg"
            },
        ]

        this.categories = [
            {name: "Automotive", url: "https://i.pinimg.com/originals/91/06/02/910602979bda92b9f88144d313f52725.png"},
            {name: "Groceries", url: "https://www.pngmart.com/files/7/Groceries-Transparent-Images-PNG.png"},
            {name: "Home Applience", url: "https://www.pngall.com/wp-content/uploads/11/Home-Appliance-Background-PNG.png"},
            {name: "Food & Beverages", url: "https://i.dlpng.com/static/png/6422046_preview.png"},
            {name: "Fruits & Vegetables", url: "https://purepng.com/public/uploads/large/purepng.com-fruits-and-vegetablesfruits-vegetables-941524726984vjp58.png"},
            {name: "Electronic Devices", url: "https://freepikpsd.com/file/2019/10/electronic-devices-png-6-Transparent-Images.png"},
            {name: "Health & Wellbeing", url: "https://pngimg.com/uploads/no_drugs/no_drugs_PNG78.png"},
            {name: "Home Exercise Equipments", url: "https://pngimg.com/uploads/gym_equipment/gym_equipment_PNG85.png"},
        ]

        // Subscribe to platform data
        this._platformsService.platform$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((platform: Platform) => {
            if (platform) {
                this.platform = platform;
        
                this.countryCode = this.platform.country;

                this._storesService.getStoreTop(this.countryCode)
                .subscribe((response)=>{
                    this.image = response.topStoreAsset;
                    
                });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }
}
