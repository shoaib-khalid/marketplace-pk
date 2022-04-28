import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { FuseCardModule } from '@fuse/components/card';
import { LandingLocationsComponent } from './locations.component';
import { landingLocationsRoutes } from './locations.routing';

@NgModule({
    declarations: [
        LandingLocationsComponent
    ],
    imports     : [
        RouterModule.forChild(landingLocationsRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        MatInputModule,
        FuseCardModule
    ]
})
export class LandingLocationsModule
{
}
