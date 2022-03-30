import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingTokenComponent } from 'app/modules/landing/token/token.component';
import { landingTokenRoutes } from 'app/modules/landing/token/token.routing';

@NgModule({
    declarations: [
        LandingTokenComponent
    ],
    imports     : [
        RouterModule.forChild(landingTokenRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule
    ]
})
export class LandingTokenModule
{
}
