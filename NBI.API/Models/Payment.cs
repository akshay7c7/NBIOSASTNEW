using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace NBI.API.Models
{
    public class Payment
    {
        
        public int PaymentId { get; set; }
        public int DriverId { get; set; }
        public int PaymentAmount { get; set; }
        public DateTime PaymentTime { get; set; }
    }
}