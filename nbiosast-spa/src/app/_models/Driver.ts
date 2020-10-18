export interface Driver{
    id :number,
    name :string,
    document : File,      
    certificateNo : string,
    licenseNo :string,
    transPortName :string,
    transPortAddress :string,
    transPortPhoneNo :string,
    address :string,
    amount :string,
    paymentType :string,
    dob :string,
    trainingStartDate :string,
    trainingEndDate :string,
    trainingPeriod :number,
    photo :string,             
    oneDayDoc: File,
    validity:any
    branchVisited:any    
}