import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginationModule } from 'app/layout/common/pagination/pagination.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs'
import { MatTableModule } from '@angular/material/table';
import { FuseCardModule } from '@fuse/components/card';
import { AddressSettingsComponent } from './address-setting.component';
import { addressSettingsRoutes } from './address-setting.routing'
import { EditAddressDialog } from './edit-address/edit-address.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
    declarations: [
        AddressSettingsComponent,
        EditAddressDialog
    ],
    imports     : [
        RouterModule.forChild(addressSettingsRoutes),
        MatButtonModule,
        MatPaginatorModule,
        PaginationModule,
        MatIconModule,
        MatTabsModule,
        MatMenuModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatDialogModule,
        MatRadioModule,
        FuseCardModule,
        MatExpansionModule,
        SharedModule,
        NgxMatSelectSearchModule
    ],
    providers   : [
        DatePipe
    ]
})
export class AddressSettingsModule
{
}
