
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MoreLinq;
using NBI.API.Data;
using NBI.API.Dtos;
using NBI.API.Models;
using NBI.API.Helper;

namespace NBI.API.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    [AllowAnonymous]
    public class DriverController : ControllerBase
    {
        private readonly IMapper _mapper;
        public DataContext _context { get; }
        public DriverController(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpPost("AddDriver")]
        public async Task<IActionResult> AddDriver([FromForm]DriverCreationDto driverDto)
        {   
                Console.WriteLine(driverDto.TrainingEndDate);
                var dataWithoutFiles = _mapper.Map<DriverReturnData>(driverDto);
                var dataWithoutFilesAdd = _mapper.Map<Driver>(dataWithoutFiles);
                await _context.AddAsync(dataWithoutFilesAdd);
                var result = await _context.SaveChangesAsync()>0;
                if(result==false)
                {
                    return BadRequest("Could not add the driver details");
                }
                var id = dataWithoutFilesAdd.Id;
                System.Console.WriteLine(id);
                DriverReturnFiles driverFilesDto = new DriverReturnFiles();
                if(driverDto.Document!=null)
                {
                    string ext = System.IO.Path.GetExtension(driverDto.Document.FileName);
                    string filename = "doc"+ id.ToString() + ext;
                    System.Console.WriteLine(filename);
                    string filepath = "wwwroot/assets/"+ filename;
                    using (var fileStream = new FileStream(filepath, FileMode.Create))
                    {
                    await driverDto.Document.CopyToAsync(fileStream);
                    }
                    driverFilesDto.Document=filename;
                }
                
                if(driverDto.OneDayDoc!=null && driverDto.TrainingPeriod==1)
                {
                    string ext = System.IO.Path.GetExtension(driverDto.OneDayDoc.FileName);
                    string filename = "cer"+ id.ToString() + ext;
                    System.Console.WriteLine(filename);
                    string filepath = "wwwroot/assets/"+ filename;
                    using (var fileStream = new FileStream(filepath, FileMode.Create))
                    {
                    await driverDto.OneDayDoc.CopyToAsync(fileStream);
                    }   
                    driverFilesDto.OneDayDoc=filename;
                }

                if(driverDto.Photo!=null)
                {
                    string ext = System.IO.Path.GetExtension(driverDto.Photo.FileName);
                    string filename = "img"+ id.ToString() + ext;
                    System.Console.WriteLine(filename);
                    string filepath = "wwwroot/assets/"+filename;
                    using (var fileStream = new FileStream(filepath, FileMode.Create))
                    {
                    await driverDto.Photo.CopyToAsync(fileStream);      
                    }
                    driverFilesDto.Photo=filename;
                }
                //System.Console.WriteLine(dataWithoutFiles.Id);
                _mapper.Map(driverFilesDto, dataWithoutFilesAdd);
                result = await _context.SaveChangesAsync()>0;
                if(result==false)
                {
                    await DeleteDriver(dataWithoutFilesAdd.Id);
                    return BadRequest("Error in saving files ,Could not add the driver details");
                }
                //System.Console.WriteLine(dataWithoutFiles.Id);
                var r = DoPayment(dataWithoutFilesAdd.Id, dataWithoutFiles.Created , dataWithoutFiles.Amount);
                if(await r)
                {
                    return Ok();
                }
                return BadRequest("Error saving Data");
        
        }

        [HttpGet("getdriver/{id}")]
        public async Task<IActionResult> GetDriver(int id)
        {
              var driverFromRepo = await _context.Drivers.FirstOrDefaultAsync(x=>x.Id==id);
              return Ok(driverFromRepo);
        }

        [HttpGet("getAlldrivers")]
        public async Task<IActionResult> GetAllDrivers([FromQuery] DriverParams driverParams)
        {   
            var drivers  =  _context.Drivers.OrderByDescending(x=>x.Id).AsQueryable();
            if(!string.IsNullOrEmpty(driverParams.BranchCity))
            {
                if(driverParams.BranchCity=="ALL")
                {
                    drivers = drivers.OrderByDescending(x=>x.Id).AsQueryable();
                }
                else{
                    drivers = drivers.Where(x=>x.BranchVisited == driverParams.BranchCity);
                }
                
            }
            if(!string.IsNullOrEmpty(driverParams.Status))
            {
                if(driverParams.Status=="BOTH")
                {
                    drivers = drivers.OrderByDescending(x=>x.Id).AsQueryable();
                }
                else{
                    drivers = drivers.Where(x=>x.Status == driverParams.Status);
                }
                
            }
            if(driverParams.ExpiredCard=="YES")
            {
                
                drivers = drivers.Where(x=>x.TrainingEndDate<=System.DateTime.Today);
               
            }
            var pLDrivers =  await PagedList<Driver>.CreateAsync(drivers, driverParams.PageNumber, driverParams.PageSize);
            var driverListToReturn = _mapper.Map<IEnumerable<DriverReturnDto>>(pLDrivers);
            Response.AddPagination(pLDrivers.CurrentPage, pLDrivers.PageSize, pLDrivers.TotalCount, pLDrivers.TotalPages);
            return Ok(driverListToReturn); 
  
        }
        [HttpDelete("DeleteDriver/{id}")]
        public async Task<IActionResult> DeleteDriver(int id)
        {
            var driverToDelete = await _context.Drivers.FirstOrDefaultAsync(x=>x.Id==id);
            if(driverToDelete.Document!=null)
            {
                if(System.IO.File.Exists("wwwroot/assets/"+ driverToDelete.Document))
                {
                    System.IO.File.Delete("wwwroot/assets/"+ driverToDelete.Document);
                    System.Console.WriteLine("Deleted..doc");
                }

            }
            if(driverToDelete.OneDayDoc!=null)
            {
                if(System.IO.File.Exists("wwwroot/assets/"+ driverToDelete.OneDayDoc))
                {
                    System.IO.File.Delete("wwwroot/assets/"+ driverToDelete.OneDayDoc);
                    System.Console.WriteLine("Deleted..cer");
                }

            }
            if(driverToDelete.Photo!=null)
            {
                if(System.IO.File.Exists("wwwroot/assets/"+ driverToDelete.Photo))
                {
                    System.IO.File.Delete("wwwroot/assets/"+ driverToDelete.Photo);
                    System.Console.WriteLine("Deleted..img");
                }

            }
            _context.Drivers.Remove(driverToDelete);
            await _context.SaveChangesAsync();
            return Ok(new {message = "Deleted Successfully"});
        }

        [HttpPut("UpdateDriver/{id}")]
        public async Task<IActionResult> EditDriver(int id, [FromForm]DriverCreationDto driverDto)
        {
            var driverFromRepo = await _context.Drivers.FirstOrDefaultAsync(x=>x.Id==id);
            if(driverFromRepo.Status=="Approved")
            {
                return BadRequest("You cannot edit an approved License");
            }

            bool changes = false;
            if(driverFromRepo.TrainingPeriod==1 && driverDto.TrainingPeriod==3)
            {
                if(System.IO.File.Exists("wwwroot/assets/"+ driverFromRepo.OneDayDoc))
                {
                    System.IO.File.Delete("wwwroot/assets/"+ driverFromRepo.OneDayDoc);
                    System.Console.WriteLine("Deleted..");
                }
            }
            
             Driver driverToUpdate = new Driver();
             driverToUpdate.Id = driverFromRepo.Id;
                if(driverDto.Document!=null)
                {
                    System.Console.WriteLine("doc");
                    if(driverFromRepo.Document!=null)
                    {
                         if(System.IO.File.Exists("wwwroot/assets/"+ driverFromRepo.Document))
                        {
                            System.IO.File.Delete("wwwroot/assets/"+ driverFromRepo.Document);
                            System.Console.WriteLine("Deleted..");
                        }

                    }
                    string ext = System.IO.Path.GetExtension(driverDto.Document.FileName);
                    string filename = "doc"+driverFromRepo.Id.ToString() + ext;
                    string filepath = "wwwroot/assets/"+ filename;
                    using (var fileStream = new FileStream(filepath, FileMode.Create))
                    {
                        await driverDto.Document.CopyToAsync(fileStream);
                        changes = true;
                    }
                    driverToUpdate.Document=filename;
                    System.Console.WriteLine(filename);
                }
                
                if(driverDto.OneDayDoc!=null)
                {
                     System.Console.WriteLine("cer");
                    if(driverFromRepo.OneDayDoc != null)
                    {
                        if(System.IO.File.Exists("wwwroot/assets/"+ driverFromRepo.OneDayDoc))
                        {
                            System.IO.File.Delete("wwwroot/assets/"+ driverFromRepo.OneDayDoc);
                           // System.Console.WriteLine("Deleted..");
                        }

                    }
                    string ext = System.IO.Path.GetExtension(driverDto.OneDayDoc.FileName);
                    string filename = "cer"+driverFromRepo.Id.ToString() + ext;
                    string filepath = "wwwroot/assets/"+ filename;
                    using (var fileStream = new FileStream(filepath, FileMode.Create))
                    {
                    await driverDto.OneDayDoc.CopyToAsync(fileStream);
                    changes = true;
                    }
                    driverToUpdate.OneDayDoc=filename;
                    //System.Console.WriteLine(filename);
                    
                }

                if(driverDto.Photo!=null)
                {
                    System.Console.WriteLine("img");
                    if(driverFromRepo.Photo!=null)
                    {
                         if(System.IO.File.Exists("wwwroot/assets/"+ driverFromRepo.Photo))
                        {
                            System.IO.File.Delete("wwwroot/assets/"+ driverFromRepo.Photo);
                            System.Console.WriteLine("Deleted..");
                        }

                    }
                    string ext = System.IO.Path.GetExtension(driverDto.Photo.FileName);
                    string filename = "img"+driverFromRepo.Id.ToString() + ext;
                    string filepath = "wwwroot/assets/"+ filename;
                    using (var fileStream = new FileStream(filepath, FileMode.Create))
                    {
                    await driverDto.Photo.CopyToAsync(fileStream);
                    changes = true;
                    }
                    driverToUpdate.Photo=filename;
                    System.Console.WriteLine(filename);
                }
                if(driverToUpdate.Document==null)
                {
                    driverToUpdate.Document = driverFromRepo.Document;

                }
                 if(driverToUpdate.OneDayDoc==null)
                {
                    driverToUpdate.OneDayDoc = driverFromRepo.OneDayDoc;

                }
                 if(driverToUpdate.Photo==null)
                {
                    driverToUpdate.Photo = driverFromRepo.Photo;
                }
                var driverNormalData = _mapper.Map<DriverDataWithoutFiles>(driverDto);
                _mapper.Map(driverToUpdate, driverFromRepo);
                var a = _mapper.Map(driverNormalData, driverFromRepo);
                if(await _context.SaveChangesAsync()>0 || changes )
                {
                    var r = (from p in _context.Payments where p.DriverId == id select p).SingleOrDefault();
                    r.PaymentAmount = driverDto.Amount;
                    await _context.SaveChangesAsync();
                    return Ok(await _context.Drivers.FirstOrDefaultAsync(x=>x.Id==id));
                }
                
                return BadRequest("Changes Not Made");

        }

        [HttpPut("Approve/{id}")]
        public async Task<IActionResult> ApproveDriver(int id)
        {
            var driverToDelete = await _context.Drivers.FirstOrDefaultAsync(x=>x.Id==id);
            await _context.Drivers.Where(x=>x.Id==id).ForEachAsync(z=>z.Status="Approved");
            await _context.SaveChangesAsync();
            return Ok(new {message = "Status changed to "+driverToDelete.Status+" for "+driverToDelete.Name});
        }

        [HttpPut("PutOnPending/{id}")]
        public async Task<IActionResult> PutOnPending(int id)
        {
            var driverToDelete = await _context.Drivers.FirstOrDefaultAsync(x=>x.Id==id);
            await _context.Drivers.Where(x=>x.Id==id).ForEachAsync(z=>z.Status="Pending");
            await _context.SaveChangesAsync();
            return Ok(new {message = "Status changed to "+driverToDelete.Status+" for "+driverToDelete.Name});
        }

        [HttpPut("RecordPrint/{id}")]
         public async Task<IActionResult> RecordPrint(int id)
        {
            var driverToPrint = await _context.Drivers.FirstOrDefaultAsync(x=>x.Id==id);
            await _context.Drivers.Where(x=>x.Id==id).ForEachAsync(z=>z.PrintTime=DateTime.Today);
            await _context.SaveChangesAsync();
            return Ok(new {message = "Status changed to "+driverToPrint.PrintTime+" for "+driverToPrint.Name});
        }

        [HttpGet("GetDashData/{branch}")]
        public async Task<IActionResult> GetDashData(string branch)
        {
            Dashboard dash = new Dashboard();
            var drivers =  _context.Drivers.AsQueryable();
            if(branch=="ALL")
            {
               drivers =  _context.Drivers.AsQueryable();
            }
            else{
                drivers =  _context.Drivers.Where(x=>x.BranchVisited==branch).AsQueryable();
            }
            dash.TodayDrivers = await drivers.Where(x=>x.Created == DateTime.Today).CountAsync();
            var TotalAmount = await _context.Payments.Where(x=>x.PaymentTime == DateTime.Today).Select(x=>x.PaymentAmount).ToListAsync();
            dash.TodayAmount = TotalAmount.Sum(x=>x);
            dash.TodayPrints = await drivers.Where(x=>x.PrintTime == DateTime.Today).CountAsync();

            var weekdate = DateTime.Now.StartOfWeek(DayOfWeek.Monday);
            var WeekDrivers = await  drivers.Where(x=> x.Created >= weekdate).ToListAsync();
            dash.WeekDrivers = WeekDrivers.Count();
            var WeekAmount = await _context.Payments.Where(x=> x.PaymentTime>= weekdate).Select(x=>x.PaymentAmount).ToListAsync();
            dash.WeekAmount = WeekAmount.Sum(x=>x);
            dash.WeekPrints = await drivers.Where(x=> x.PrintTime >= weekdate).CountAsync();

            dash.AnnualDrivers = await drivers.CountAsync();
            var AnnualAmount = await _context.Payments.Select(x=>x.PaymentAmount).ToListAsync();
            dash.AnnualAmount = AnnualAmount.Sum(x=>x);
            dash.AnnualPrints = await drivers.Where(x=>x.PrintTime != new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)).CountAsync();
            
            return Ok(dash);
        }



        
        [Authorize(Roles="DriverAdmin,BranchAdmin,AccountAdmin,SuperAdmin")]
        [HttpGet("GetDrivercitylist")]    
        public async Task<IActionResult> GetDrivercitylist()
        {
            
            var drivers = await _context.Drivers.ToListAsync();
            if(drivers!=null)
            {
                var listOfCities =drivers.Select(x=>x.BranchVisited).Distinct();
                 if(listOfCities!=null)
                {
                    return Ok(listOfCities);
                }
            }
            
           
            return NotFound();
            
        }

        private async Task<bool> DoPayment(int driverId, DateTime paymentTime, int paymentAmount)
        {
            
            Payment p = new Payment();
            p.DriverId= driverId;
            p.PaymentTime = paymentTime;
            p.PaymentAmount = paymentAmount;
            await _context.Payments.AddAsync(p);
            var result =  await _context.SaveChangesAsync() >0;
            if(result)
            {
                return true;
            }
            return false;
        }




        


    }
}