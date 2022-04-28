import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { FuseCardModule } from '@fuse/components/card';
import { LandingStoresComponent } from './stores.component';
import { landingStoresRoutes } from './stores.routing';

@NgModule({
    declarations: [
        LandingStoresComponent
    ],
    imports     : [
        RouterModule.forChild(landingStoresRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        MatInputModule,
        FuseCardModule
    ]
})
export class LandingStoresModule
{
}
