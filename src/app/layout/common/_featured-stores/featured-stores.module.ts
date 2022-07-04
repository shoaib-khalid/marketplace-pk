import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { _FeaturedStoresComponent } from 'app/layout/common/_featured-stores/featured-stores.component';
import { DatePipe } from '@angular/common';

@NgModule({
    declarations: [
        _FeaturedStoresComponent
    ],
    imports     : [
        RouterModule.forChild([]),
        SharedModule
    ],
    providers: [
        // CurrencyPipe,
        DatePipe
    ],
    exports     : [
        _FeaturedStoresComponent
    ]
})
export class _FeaturedStoresModule
{
}
