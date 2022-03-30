import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { FnbLayoutComponent } from 'app/layout/symplified/fnb/fnb.component';
import { MatIconModule } from '@angular/material/icon';
import { FuseAlertModule } from '@fuse/components/alert';
import { DatePipe } from '@angular/common';
import { FuseDrawerModule } from '@fuse/components/drawer';
import { MatButtonModule } from '@angular/material/button';
import { Error404Component } from 'app/shared/error-404/error-404.component';

@NgModule({
    declarations: [
        FnbLayoutComponent,
        Error404Component
        
    ],
    imports     : [
        RouterModule,
        SharedModule,
        MatIconModule,
        FuseAlertModule,
        FuseDrawerModule,
        MatButtonModule
    ],
    exports     : [
        FnbLayoutComponent,
        Error404Component
    ],
    providers   : [
        DatePipe
    ]
})
export class FnbLayoutModule
{
}
