import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { FuseCardModule } from '@fuse/components/card';
import { landingStoresRoutes } from './stores.routing';
import { LandingStoreComponent } from './store/store.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { PaginationModule } from 'app/layout/common/pagination/pagination.module';
import { LandingProductDetailsComponent } from './product-details/product-details.component';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { _SearchModule } from 'app/layout/common/_search/search.module';
import { LandingStoresComponent } from './store-list/store-list.component';
import { _FeaturedStoresModule } from 'app/layout/common/_featured-stores/featured-stores.module';
import { _StoreProductsModule } from 'app/layout/common/_store-products/store-products.module';
import { _StoreCategoriesModule } from 'app/layout/common/_store-categories/store-categories.module';
import { ErrorBackgroundModule } from 'app/shared/error-background/error-background.module';

@NgModule({
    declarations: [
        LandingStoresComponent,
        LandingStoreComponent,
        LandingProductDetailsComponent
    ],
    imports     : [
        RouterModule.forChild(landingStoresRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        MatInputModule,
        MatSelectModule,
        FuseCardModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatMenuModule,
        PaginationModule,
        NgxGalleryModule,
        _SearchModule,
        _FeaturedStoresModule,
        FontAwesomeModule,
        _StoreProductsModule,
        _StoreCategoriesModule,
        ErrorBackgroundModule
    ],
    exports     : [
        FontAwesomeModule,
        NgxGalleryModule
    ]
})
export class LandingStoresModule
{
}
