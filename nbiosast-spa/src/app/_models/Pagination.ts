export interface Pagination {
    currentPage : any;
    itemsPerPage : any;
    totalItems : any;
    totalPages : any;
}

export class PaginatedResult<T>{
    result : T;
    pagination : Pagination;
}
