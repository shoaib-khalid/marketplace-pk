import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { FuseCardModule } from '@fuse/components/card';
import { landingCategoriesRoutes } from './categories.routing';
import { LandingCategoriesComponent } from './categories.component';

@NgModule({
    declarations: [
        LandingCategoriesComponent
    ],
    imports     : [
        RouterModule.forChild(landingCategoriesRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        MatInputModule,
        FuseCardModule
    ]
})
export class LandingCategoriesModule
{
}
