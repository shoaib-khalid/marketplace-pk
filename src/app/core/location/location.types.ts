import { ProductInventory } from "../product/product.types";

export interface ApiResponseModel<T>
{
    message?: string;
    data?: T;
    path : string;
    status: number;
    timestamp:string;
}

export interface StoresDetails
{
    id              : string;
    name            : string;
    city            : string;
    state           : string;
    postcode        : string;
    regionCountryId : string;
}

export interface ParentCategory 
{
    parentId            : string;
    parentName          : string;
    parentThumbnailUrl  : string;
}

export interface ChildCategory 
{
    id             : string;
    name           : string;
    thumbnailUrl   : string;
    parentCategory : ParentCategory;
    storeDetails   : StoreDetails;
}

export interface CategoryPagination
{
    length      : number;
    size        : number;
    page        : number;
    lastPage    : number;
    startIndex  : number;
    endIndex    : number;
}

export interface StoreDetails
{
    id              : string;
    name            : string;
    city            : string;
    state           : string;
    postcode        : string;
    regionCountryId : string;
}

export interface ProductDetails
{
    id              : string;
    name            : string;
    thumbnailUrl    : string;
    status          : string;
    storeDetails    : StoreDetails;
    productInventories : ProductInventory[];
}

export interface ProductOnLocationPagination
{
    length      : number;
    size        : number;
    page        : number;
    lastPage    : number;
    startIndex  : number;
    endIndex    : number;
}

export interface LandingLocation 
{
    id              : number;
    imageUrl        : string;
    cityId          : string;
    isDisplay       : boolean;
    cityDetails     : CityDetails;
    regionCountryId : string;
}

export interface LocationPagination
{
    length      : number;
    size        : number;
    page        : number;
    lastPage    : number;
    startIndex  : number;
    endIndex    : number;
}

export interface CityDetails
{
    id              : string;
    name            : string;
    regionCountryState : RegionCountryState;
}

export interface RegionCountryState
{
    id              : string;
    name            : string;
    regionCountryId : string
}

export interface LocationArea
{
    storeCityId         : string;
    userLocationCityId  : string;
}

// export interface ProductOnLocationPagination
// {
//     totalElements  : number;
//     size           : number;
//     number         : number;
//     totalPages     : number;
//     pageable       : {
//                         offset : number
//                      }
//     numberOfElements : number;
// }