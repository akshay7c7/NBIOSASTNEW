using System;

namespace NBI.API.Dtos
{
    public class DriverReturnData
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string CertificateNo { get; set; }
        public string LicenseNo { get; set; }
        public string TransPortName { get; set; }
        public string TransPortAddress { get; set; }
        public string TransPortPhoneNo { get; set; }
        public string Address { get; set; }
        public int Amount { get; set; }
        public string PaymentType { get; set; }
        public DateTime DOB { get; set; }
        public DateTime TrainingStartDate { get; set; }
        public DateTime TrainingEndDate { get; set; }
        public int TrainingPeriod { get; set; }
        public string Status { get; set; }
        public string BranchVisited { get; set; }
        public DateTime Created { get; set; }
        public DateTime PrintTime { get; set; }
        public int Validity { get; set; }
    }
}