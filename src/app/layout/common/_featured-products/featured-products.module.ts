import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { _FeaturedProductsComponent } from 'app/layout/common/_featured-products/featured-products.component';

@NgModule({
    declarations: [
        _FeaturedProductsComponent
    ],
    imports     : [
        RouterModule.forChild([]),
        SharedModule
    ],
    exports     : [
        _FeaturedProductsComponent
    ]
})
export class _FeaturedProductsModule
{
}
