using System;

namespace NBI.API.Dtos
{
    public class DriverReturnDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; } 
        public string TransPortPhoneNo { get; set; }
        public string Photo { get; set; }
        public string Status { get; set; }
        public string BranchVisited { get; set; }
        public DateTime TrainingEndDate { get; set; }
        public DateTime PrintTime { get; set; }
    }
}