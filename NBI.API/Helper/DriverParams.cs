using System;

namespace NBI.API.Helper
{
    public class DriverParams
    {
        private const int MaxPageSize = 50;
        public int PageNumber { get; set; } =1;
        private int pageSize = 10;
        public int PageSize
        {
            get {return pageSize;}
            set {pageSize = (value > MaxPageSize )? MaxPageSize: value;}
        }


        public int DriverId { get; set; }
        public string BranchCity { get; set; }
        public string Status { get; set; }
        public string ExpiredCard { get; set; }
    }
}