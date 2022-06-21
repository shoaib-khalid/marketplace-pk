import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrencyPipe } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginationModule } from 'app/layout/common/pagination/pagination.module';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'app/shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs'
import { voucherRoutes } from './carts.routing';
import { MatTableModule } from '@angular/material/table';
import { FuseCardModule } from '@fuse/components/card';
import { CartListComponent } from './carts.component';
import { ModalConfirmationDeleteItemComponent } from './modal-confirmation-delete-item/modal-confirmation-delete-item.component';

@NgModule({
    declarations: [
        CartListComponent,
        ModalConfirmationDeleteItemComponent
    ],
    imports     : [
        RouterModule.forChild(voucherRoutes),
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatSelectModule,
        MatInputModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatMenuModule,
        PaginationModule,
        SharedModule,
        MatTabsModule,
        FuseCardModule
    ],
    providers: [
        CurrencyPipe
    ],
    bootstrap   : [
    ]
})
export class CartsModule
{
}
