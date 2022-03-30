import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { buyerRoutes } from 'app/modules/buyer/buyer.routing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'app/shared/shared.module';
import { PaginationModule } from 'app/layout/common/pagination/pagination.module';
import { OrderListComponent } from './order-list/order-list.component';

@NgModule({
    declarations: [
        OrderListComponent
    ],
    imports     : [
        RouterModule.forChild(buyerRoutes),
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatInputModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatMenuModule,
        PaginationModule,
        SharedModule
    ],
    bootstrap   : [
    ]
})
export class BuyerModule
{
}
