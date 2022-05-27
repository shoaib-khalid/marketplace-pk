import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { LocationService } from 'app/core/location/location.service';
import { LocationPagination } from 'app/core/location/location.types';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { map, merge, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-locations',
    templateUrl  : './location-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingLocationsComponent implements OnInit
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    locations: any;
    pagination: LocationPagination;

    pageOfItems: Array<any>;
    isLoading: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _platformsService: PlatformService,
        private _locationService: LocationService,
    )
    {
    }

    ngOnInit(): void {
        this.locations = [
            {
                capitalCity: "Kuala Lumpur",
                scene: "https://www.wallpapers13.com/wp-content/uploads/2016/07/Kuala-Lumpur-City-Centre-Panaromic-Desktop-Wallpaper-HD-resolution-2880x1620-840x525.jpg",
                locationId: 'kuala-lumpur'
            },
            {
                capitalCity: "George Town",
                scene: "https://c0.wallpaperflare.com/preview/258/481/240/malaysia-george-town-oldtown-old.jpg",
                locationId: 'george-town'
            },
            {
                capitalCity: "Malacca",
                scene: "https://dailytravelpill.com/wp-content/uploads/2018/08/things-to-see-and-do-melaka-malacca-7.jpg",
                locationId: 'malacca'
            },
            {
                capitalCity: "Ipoh",
                scene: "https://www.pttoutdoor.com/wp-content/uploads/2020/03/Ipoh-Malaysia-header.jpg",
                locationId: 'ipoh'
            },
            {
                capitalCity: "Johor Bharu",
                scene: "https://media.istockphoto.com/photos/johor-bahru-picture-id497342101?b=1&k=20&m=497342101&s=170667a&w=0&h=evsi-h0v4eSk5uZ-2eyD8wX1MSV7VeG2pz63fl4Xg2g=",
                locationId: 'johor-bahru'
            },
            {
                capitalCity: "Kuala Terengganu",
                scene: "https://media.istockphoto.com/photos/terengganu-drawbridge-dramatic-sunset-picture-id1210927434?b=1&k=20&m=1210927434&s=170667a&w=0&h=GzObm6Saq8g-7WexakN0Ko_sanl_-RFpl_LbX7SKTEI=",
                locationId: 'kuala-terengganu'
            },
            {
                capitalCity: "Shah Alam",
                scene: "https://c4.wallpaperflare.com/wallpaper/644/192/852/shah-alam-blue-mosque-white-and-blue-mosque-wallpaper-preview.jpg",
                locationId: 'shah-alam'
            },
            {
                capitalCity: "Kuching",
                scene: "https://c4.wallpaperflare.com/wallpaper/691/1009/261/monuments-sarawak-state-legislative-assembly-malaysia-sarawak-wallpaper-preview.jpg",
                locationId: 'kuching'
            },
            {
                capitalCity: "Kota Bharu",
                scene: "https://media.istockphoto.com/photos/sultan-ismail-petra-arch-picture-id1130828522?k=20&m=1130828522&s=612x612&w=0&h=TDuZi3GGnO8H481F4syCPtC0JF7D86GLn81xfNqaKIE=",
                locationId: 'kota-bharu'
            },
            {
                capitalCity: "Kangar",
                scene: "https://wallpapercave.com/wp/wp3206009.jpg",
                locationId: 'kangar'
            },
            {
                capitalCity: "Kota Kinabalu",
                scene: "https://wallpaperaccess.com/full/7410506.jpg",
                locationId: 'kota-kinabalu'
            },
            {
                capitalCity: "Kuantan",
                scene: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Pahang_state_mosque.jpg/1280px-Pahang_state_mosque.jpg",
                locationId: 'kuantan'
            },
            {
                capitalCity: "Alor Setar",
                scene: "https://cari-homestay.com/wp-content/uploads/2017/03/Alor-Setar-Tower.jpg",
                locationId: 'alor-setar'
            },
            {
                capitalCity: "Seremban",
                scene: "https://c0.wallpaperflare.com/preview/923/146/366/malaysia-seremban-canon-70d.jpg",
                locationId: 'seremban'
            },
        ]

        // Get customer voucher pagination, isUsed = false 
        this._locationService.locationPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: LocationPagination) => {

                this.pagination = response; 
                
                // Mark for check
                this._changeDetectorRef.markForCheck();           
            });
    }

    onChangePage(pageOfItems: Array<any>) {
        
        // update current page of items
        this.pageOfItems = pageOfItems;
        
        if(this.pagination && this.pageOfItems['currentPage']) {

            if (this.pageOfItems['currentPage'] - 1 !== this.pagination.page) {
                // set loading to true
                this.isLoading = true;
    
                this._locationService.getLocations(this.pageOfItems['currentPage'] - 1, this.pageOfItems['pageSize'])
                    .subscribe(()=>{
                        // set loading to false
                        this.isLoading = false;
                    });
    
            }
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
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
                        return this._locationService.getLocations(0, 10);
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                ).subscribe();
            }
        }, 0);
    }
}
