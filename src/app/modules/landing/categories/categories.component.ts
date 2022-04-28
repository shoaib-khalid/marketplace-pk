import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PlatformService } from 'app/core/platform/platform.service';
import { Platform } from 'app/core/platform/platform.types';
import { StoresService } from 'app/core/store/store.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'landing-categories',
    templateUrl  : './categories.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingCategoriesComponent implements OnInit
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    categories: any;

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

    }
}
