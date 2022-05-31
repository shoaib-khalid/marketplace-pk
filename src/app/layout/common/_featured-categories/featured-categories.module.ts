import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { _FeaturedCategoriesComponent } from 'app/layout/common/_featured-categories/featured-categories.component';

@NgModule({
    declarations: [
        _FeaturedCategoriesComponent
    ],
    imports     : [
        RouterModule.forChild([]),
        SharedModule
    ],
    exports     : [
        _FeaturedCategoriesComponent
    ]
})
export class _FeaturedCategoriesModule
{
}
