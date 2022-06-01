import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AppConfig } from 'app/config/service.config';
import { JwtService } from '../jwt/jwt.service';
import { LogService } from '../logging/log.service';
import { ApiResponseModel, ChildCategory, LandingLocation, LocationPagination, ParentCategory, ProductDetails, ProductOnLocation, ProductOnLocationPagination, StoresDetails } from './location.types';
import { Store, StorePagination } from '../store/store.types';

@Injectable({
    providedIn: 'root'
})
export class LocationService
{
    private _storesDetails: BehaviorSubject<StoresDetails[] | null> = new BehaviorSubject<StoresDetails[]>(null);
    private _productsDetails: BehaviorSubject<ProductDetails[] | null> = new BehaviorSubject<ProductDetails[]>(null);
    private _parentCategories: BehaviorSubject<ParentCategory[] | null> = new BehaviorSubject<ParentCategory[]>(null);
    private _parentCategory: BehaviorSubject<ParentCategory | null> = new BehaviorSubject<ParentCategory>(null);
    private _childCategory: BehaviorSubject<ChildCategory | null> = new BehaviorSubject<ChildCategory>(null);
    private _locationProducts: BehaviorSubject<ProductOnLocation[] | null> = new BehaviorSubject<ProductOnLocation[]>(null);
    private _locationProductsPagination: BehaviorSubject<ProductOnLocationPagination | null> = new BehaviorSubject(null);
    private _locations: BehaviorSubject<LandingLocation[] | null> = new BehaviorSubject<LandingLocation[]>(null);
    private _location: BehaviorSubject<LandingLocation | null> = new BehaviorSubject<LandingLocation>(null);
    private _locationPagination: BehaviorSubject<LocationPagination | null> = new BehaviorSubject(null);

    // for featured store display
    private _featuredStore: BehaviorSubject<StoresDetails | null> = new BehaviorSubject(null);
    private _featuredStores: BehaviorSubject<StoresDetails[] | null> = new BehaviorSubject(null);
    private _featuredStorePagination: BehaviorSubject<StorePagination | null> = new BehaviorSubject(null);
    
    

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService,
        private _apiServer: AppConfig,
        private _jwt: JwtService,
        private _logging: LogService
)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for parent categories
     */
    get storesDetails$(): Observable<StoresDetails[]>
    {
        return this._storesDetails.asObservable();
    }

    /**
     * Getter for parent categories
     */
    get productsDetails$(): Observable<ProductDetails[]>
    {
        return this._productsDetails.asObservable();
    }

    /**
     * Getter for parent categories
     */
    get parentCategories$(): Observable<ParentCategory[]>
    {
        return this._parentCategories.asObservable();
    }

    /**
     * Getter for parentCategory
     */
    get parentCategory$(): Observable<ParentCategory>
    {
        return this._parentCategory.asObservable();
    }

    /**
     * Getter for childCategory
     */
    get childCategory$(): Observable<ChildCategory>
    {
        return this._childCategory.asObservable();
    }

    /**
     * Getter for locationProducts
     */
     get locationProducts$(): Observable<ProductOnLocation[]>
     {
         return this._locationProducts.asObservable();
     }

     /**
     * Getter for locationProducts pagination
     */
    get locationProductsPagination$(): Observable<ProductOnLocationPagination>
    {
        return this._locationProductsPagination.asObservable();
    }

    /**
     * Getter for locations
     */
    get locations$(): Observable<LandingLocation[]>
    {
        return this._locations.asObservable();
    }

    /**
     * Getter for location
     */
     get location$(): Observable<LandingLocation>
     {
         return this._location.asObservable();
     }

     /**
     * Getter for locationProducts pagination
     */
    get locationPagination$(): Observable<LocationPagination>
    {
        return this._locationPagination.asObservable();
    }

    // ----------------------
    //    Featured Store
    //----------------------- 

    /**
    * Getter for store
    *
    */
     get featuredStore$(): Observable<StoresDetails>
     {
         return this._featuredStore.asObservable();
     }
 
     /**
     * Setter for stores
     *
     * @param value
     */
     set featuredStore(value: StoresDetails)
     {
         // Store the value
         this._featuredStore.next(value);
     }
 
     /**
      * Getter for stores
      *
     */
     get featuredStores$(): Observable<StoresDetails[]>
     {
         return this._featuredStores.asObservable();
     }
     
     /**
      * Setter for stores
      *
      * @param value
      */
     set featuredStores(value: StoresDetails[])
     {
         // Store the value
         this._featuredStores.next(value);
     }
 
     /**
     * Getter for stores pagination
     */
     get featuredStorePagination$(): Observable<StorePagination>
     {
         return this._featuredStorePagination.asObservable();
     }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * 
     * @param storeName 
     * @param page 
     * @param pageSize 
     * @param city 
     * @param postcode 
     * @param regionCountryId 
     * @param stateId 
     * @returns 
     */
    getStoresDetails(storeName: string = '', page: number = 0, pageSize: number = 0, city: string = '', postcode: string = '', regionCountryId: string = '', stateId: string = '') 
        : Observable<StoresDetails[]>
    {
        let locationService = this._apiServer.settings.apiServer.locationService;
        let accessToken = this._authService.publicToken;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                page,
                pageSize,
                storeName,
                city,
                postcode,
                regionCountryId,
                stateId
            }
        };

        return this._httpClient.get<StoresDetails[]>(locationService + '/stores', header)
            .pipe(
                catchError(() =>
                    of(false)
                ),
                switchMap(async (response: StoresDetails[]) => {
                                
                    this._logging.debug("Response from LocationService (getStoresDetails)", response);

                    this._storesDetails.next(response["data"].content);
                    return response["data"].content;
                })
            );
    }

    /**
     * 
     * @param name 
     * @param page 
     * @param pageSize 
     * @param storeName 
     * @param cityId 
     * @param postcode 
     * @param regionCountryId 
     * @param stateId 
     * @returns 
     */
    getProductsDetails(name: string = '', page: number = 0, pageSize: number = 0, storeName: string = '', cityId: string = '', postcode: string = '', regionCountryId: string = '', stateId: string = '') 
        : Observable<ProductDetails[]>
    {
        let locationService = this._apiServer.settings.apiServer.locationService;
        let accessToken = this._authService.publicToken;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                page,
                pageSize,
                name,
                storeName,
                cityId,
                postcode,
                regionCountryId,
                stateId,
                status: ['ACTIVE', 'OUTOFSTOCK']
            }
        };

        return this._httpClient.get<ProductDetails[]>(locationService + '/products', header)
            .pipe(
                catchError(() =>
                    of(false)
                ),
                switchMap(async (response: ProductDetails[]) => {
                                
                    this._logging.debug("Response from LocationService (getProductsDetails)", response);

                    this._productsDetails.next(response["data"].content);
                    return response["data"].content;
                })
            );
    }

    /**
     * 
     * @param city 
     * @param postcode 
     * @param regionCountryId 
     * @param stateId 
     * @returns 
     */
    getParentCategories(city: string = '', postcode: string = '', regionCountryId: string = '', stateId: string = ''): Observable<ParentCategory[]>
    {        
        let locationService = this._apiServer.settings.apiServer.locationService;
        let accessToken = this._authService.publicToken;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                city,
                postcode,
                regionCountryId,
                stateId
            }
        };

        if (header.params.city === '') delete header.params.city;
        if (header.params.postcode === '') delete header.params.postcode;
        if (header.params.regionCountryId === '') delete header.params.regionCountryId;
        if (header.params.stateId === '') delete header.params.stateId;

        return this._httpClient.get<ParentCategory[]>(locationService + '/categories-location/parent-category', header)
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap(async (response: ParentCategory[]) => {
                                
                    this._logging.debug("Response from LocationService (getParentCategories)", response);

                    this._parentCategories.next(response["data"]);
                    return response["data"];
                })
            );
    }

    /**
     * Get parent category by ID
     * 
     * @param id 
     * @returns 
     */
    getParentCategoriesById(id: string): Observable<ParentCategory>
    {        
  
        return this._parentCategories.pipe(
            take(1),
            map((categories) => {

                // Find the product
                const category = categories ? categories.find(item => item.parentId === id) : null;

                this._logging.debug("Response from LocationService (Current Category)", category);

                // Update the product
                this._parentCategory.next(category);

                // Return the product
                return category;
            }),
            switchMap((category) => {

                if ( !category )
                {
                    return throwError('Could not found category with id of ' + id + '!');
                }

                return of(category);
            })
        );
    }

    /**
     * Get child categories
     * 
     * @param city 
     * @param postcode 
     * @param regionCountryId 
     * @param state 
     * @returns 
     */
    getChildCategories(city: string, postcode: string, regionCountryId: string, state: string): Observable<ChildCategory>
    {        
        let locationService = this._apiServer.settings.apiServer.locationService;
        let accessToken = this._authService.publicToken;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                city: '' + city,
                postcode: '' + postcode,
                regionCountryId: '' + regionCountryId,
                state: '' + state
            }
        };

        return this._httpClient.get<ChildCategory>(locationService + '/categories-location/child-category', header)
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap(async (response: ChildCategory) => {
                                
                    this._logging.debug("Response from LocationService (getChildCategories)", response);

                    this._childCategory.next(response["data"]);
                    return response["data"];
                })
            );

    }

    /**
     * Get products based on location
     * 
     * @param page 
     * @param pageSize 
     * @param sortByCol 
     * @param sortingOrder 
     * @param city 
     * @param postcode 
     * @param regionCountryId 
     * @param stateId 
     * @param status 
     * @returns 
     */
    getLocationBasedProducts(page: number = 0, pageSize: number = 5, sortByCol: string = 'name', sortingOrder: 'asc' | 'desc' | '' = 'asc',
        city: string = '', regionCountryId: string = '', postcode: string = '', stateId: string = '', status: string = 'ACTIVE'): 
            Observable<any>
            // Observable<{ products: ProductOnLocation[], productsPagination: ProductOnLocationPagination }>
    {        
        let locationService = this._apiServer.settings.apiServer.locationService;
        let accessToken = this._authService.publicToken;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                page        : '' + page,
                pageSize    : '' + pageSize,
                sortByCol   : '' + sortByCol,
                sortingOrder : '' + sortingOrder.toUpperCase(),
            
                city: '' + city,
                postcode: '' + postcode,
                regionCountryId: '' + regionCountryId,
                stateId: '' + stateId,
                status: '' + status
            }
        };
        
        // return this._httpClient.get<{ products: ProductOnLocation[], productsPagination: ProductOnLocationPagination }>(locationService + '/products-location', header)
        return this._httpClient.get<any>(locationService + '/products-location', header)
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap(async (response) => {
                // switchMap(async (response: { products: ProductOnLocation[], productsPagination: ProductOnLocationPagination }) => {
                                
                    this._logging.debug("Response from LocationService (getLocationBasedProducts)", response);

                    let _pagination = {
                        length: response["data"].totalElements,
                        size: response["data"].size,
                        page: response["data"].number,
                        lastPage: response["data"].totalPages,
                        startIndex: response["data"].pageable.offset,
                        endIndex: response["data"].pageable.offset + response["data"].numberOfElements - 1
                    }
                    this._locationProductsPagination.next(_pagination);
                    this._locationProducts.next(response["data"].content);

                    return response["data"].content;
                    // return {product: ProductOnLocation}
                })
            );
    }

    /**
     * Get locations
     * 
     * @param page 
     * @param pageSize 
     * @param sortByCol 
     * @param sortingOrder 
     * @param cityId 
     * @param isDisplay 
     * @returns 
     */
    getLocations(page: number = 0, pageSize: number = 20, sortByCol: string = 'cityId', sortingOrder: 'asc' | 'desc' | '' = 'asc',
        cityId: string = null, isDisplay: boolean = true): Observable<LandingLocation[]>
    {
        let locationService = this._apiServer.settings.apiServer.locationService;
        let accessToken = this._authService.publicToken;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                page        : '' + page,
                pageSize    : '' + pageSize,
                sortByCol   : '' + sortByCol,
                sortingOrder : '' + sortingOrder.toUpperCase(),

                cityId      : cityId,
                isDisplay   : isDisplay,
            }
        };

        if (!cityId) {delete header.params.cityId}

        return this._httpClient.get<LandingLocation[]>(locationService + '/config/location', header)
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap(async (response:LandingLocation[]) => {
                                
                    this._logging.debug("Response from LocationService (getLocations)", response);

                    let _pagination = {
                        length: response["data"].totalElements,
                        size: response["data"].size,
                        page: response["data"].number,
                        lastPage: response["data"].totalPages,
                        startIndex: response["data"].pageable.offset,
                        endIndex: response["data"].pageable.offset + response["data"].numberOfElements - 1
                    }
                    this._locationPagination.next(_pagination);
                    this._locations.next(response["data"].content);
                    return response["data"].content;
                })
            );
    }
 
     /**
      * Get location by ID
      * 
      * @param id 
      * @returns 
      */
    getLocationById(id: string): Observable<LandingLocation>
    {        

        return this._locations.pipe(
            take(1),
            map((locations) => {

                // Find the product
                const location = locations ? locations.find(item => item.cityId === id) : null;

                this._logging.debug("Response from LocationService (Current Location)", location);

                // Update the product
                this._location.next(location);

                // Return the product
                return location;
            }),
            switchMap((location) => {

                if ( !location )
                {
                    return throwError('Could not found location with id of ' + id + '!');
                }

                return of(location);
            })
        );
    }

    getFeaturedStores(page: number = 0, pageSize: number = 20, regionCountryId: string = '', isDisplay: boolean = true): Observable<Store[]>
    {
        let locationService = this._apiServer.settings.apiServer.locationService;
        let accessToken = this._authService.publicToken;

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${accessToken}`),
            params: {
                page        : '' + page,
                pageSize    : '' + pageSize,

                regionCountryId : regionCountryId,
                isDisplay   : isDisplay,
            }
        };

        if (!regionCountryId) {delete header.params.regionCountryId}

        return this._httpClient.get<Store[]>(locationService + '/config/store', header)
            .pipe(
                switchMap(async (response:Store[]) => {
                                
                    this._logging.debug("Response from LocationService (getFeaturedStores)", response);

                    let _pagination = {
                        length: response["data"].totalElements,
                        size: response["data"].size,
                        page: response["data"].number,
                        lastPage: response["data"].totalPages,
                        startIndex: response["data"].pageable.offset,
                        endIndex: response["data"].pageable.offset + response["data"].numberOfElements - 1
                    }
                    this._featuredStorePagination.next(_pagination);
                    this._featuredStores.next(response["data"].content);

                    return response["data"].content;
                })
            );
    }
}
