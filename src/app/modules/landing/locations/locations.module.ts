import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { FuseCardModule } from '@fuse/components/card';
import { landingLocationsRoutes } from './locations.routing';
import { LandingLocationsComponent } from './location-list/location-list.component';
import { LocationComponent } from './location/location.component';
import { PaginationModule } from 'app/layout/common/pagination/pagination.module';

@NgModule({
    declarations: [
        LandingLocationsComponent,
        LocationComponent
    ],
    imports     : [
        RouterModule.forChild(landingLocationsRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        MatInputModule,
        FuseCardModule,
        PaginationModule
    ]
})
export class LandingLocationsModule
{
}
