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
import { BuyerCheckoutComponent } from './checkout.component';
import { BuyerCheckoutRoutes } from './checkout.routing';
import { FuseCardModule } from '@fuse/components/card';
import { ModalConfirmationDeleteItemComponent } from './modal-confirmation-delete-item/modal-confirmation-delete-item.component';
import { AddressSettingComponent } from './address-setting/address-setting.component';

@NgModule({
    declarations: [
        BuyerCheckoutComponent,
        ModalConfirmationDeleteItemComponent,
        AddressSettingComponent
    ],
    imports     : [
        RouterModule.forChild(BuyerCheckoutRoutes),
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatDialogModule,
        MatRadioModule,
        FuseCardModule,
        MatExpansionModule,
        SharedModule,
    ],
    providers   : [
        DatePipe
    ]
})
export class BuyerCheckoutModule
{
}
