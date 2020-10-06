using System.Runtime.CompilerServices;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
            
                var fileID=1;
                var driverIdList = await _context.Drivers.Select(x=>x.Id).ToListAsync();
                if(driverIdList.Count==0)
                {
                     fileID = fileID+1;
                }
                else{
                    fileID =  driverIdList.Max();
                }

                DriverReturnFiles driverFilesDto = new DriverReturnFiles();
                if(driverDto.Document!=null)
                {
                    string ext = System.IO.Path.GetExtension(driverDto.Document.FileName);
                    string filename = (fileID+1).ToString() + ext;
                    filename = "doc"+filename;
                    System.Console.WriteLine(filename);
                    string filepath = "wwwroot/assets/"+ filename;
                    using (var fileStream = new FileStream(filepath, FileMode.Create))
                    {
                    await driverDto.Document.CopyToAsync(fileStream);
                    }
                    driverFilesDto.Document=filename;
                }
                
                if(driverDto.OneDayDoc!=null)
                {
                    string ext = System.IO.Path.GetExtension(driverDto.OneDayDoc.FileName);
                    string filename = (fileID+1).ToString() + ext;
                    filename = "cer"+filename;
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
                    string filename = (fileID+1).ToString() + ext;
                    filename = "img"+filename;
                    System.Console.WriteLine(filename);
                    string filepath = "wwwroot/assets/"+filename;
                    using (var fileStream = new FileStream(filepath, FileMode.Create))
                    {
                    await driverDto.Photo.CopyToAsync(fileStream);      
                    }
                    driverFilesDto.Photo=filename;
                }

                var drivertoSave = _mapper.Map<DriverReturnData>(driverDto);
                var drivertoSave2 = _mapper.Map<Driver>(driverFilesDto);
                var driverToCreate = _mapper.Map(drivertoSave, drivertoSave2);

                await _context.AddAsync(driverToCreate);
                await _context.SaveChangesAsync();
                return Ok(new{message = "Created Successfully"});
        
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

             Driver driverToUpdate = new Driver();
             driverToUpdate.Id = driverFromRepo.Id;
                if(driverDto.Document!=null)
                {
                    System.Console.WriteLine("doc");
                    string ext = System.IO.Path.GetExtension(driverDto.Document.FileName);
                    string filename = "doc"+driverFromRepo.Id.ToString() + ext;
                    string filepath = "wwwroot/assets/"+ filename;
                    using (var fileStream = new FileStream(filepath, FileMode.Create))
                    {
                    await driverDto.Document.CopyToAsync(fileStream);
                    }
                    driverToUpdate.Document=filename;
                }
                
                if(driverDto.OneDayDoc!=null)
                {
                    System.Console.WriteLine("cer");
                    string ext = System.IO.Path.GetExtension(driverDto.OneDayDoc.FileName);
                    string filename = "cer"+driverFromRepo.Id.ToString() + ext;
                    string filepath = "wwwroot/assets/"+ filename;
                    using (var fileStream = new FileStream(filepath, FileMode.Create))
                    {
                    await driverDto.OneDayDoc.CopyToAsync(fileStream);
                    }
                    driverToUpdate.OneDayDoc=filename;
                }

                if(driverDto.Photo!=null)
                {
                    System.Console.WriteLine("img");
                    string ext = System.IO.Path.GetExtension(driverDto.Photo.FileName);
                    string filename = "img"+driverFromRepo.Id.ToString() + ext;
                    string filepath = "wwwroot/assets/"+ filename;
                    using (var fileStream = new FileStream(filepath, FileMode.Create))
                    {
                    await driverDto.Photo.CopyToAsync(fileStream);
                    }
                    driverToUpdate.Photo=filename;
                }

               
                
                
                var driverNormalData = _mapper.Map<DriverDataWithoutFiles>(driverDto);
                _mapper.Map(driverToUpdate, driverFromRepo);
                var a = _mapper.Map(driverNormalData, driverFromRepo);
                if(await _context.SaveChangesAsync()>0)
                {
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

        [HttpGet("TodayData")]
        public async Task<IActionResult> GetTodaysData()
        {
            Dashboard dash = new Dashboard();
            dash.TodayDrivers = await _context.Drivers.Where(x=>x.Created == DateTime.Today).CountAsync();
            var TotalAmount = await _context.Drivers.Where(x=>x.Created == DateTime.Today)
                                    .Select(x=>x.Amount).ToListAsync();
            dash.TodayAmount = TotalAmount.Sum(x=>x);
            dash.TodayPrints = await _context.Drivers.Where(x=>x.PrintTime == DateTime.Today).CountAsync();

            var weekdate = DateTime.Now.StartOfWeek(DayOfWeek.Monday);

            var WeekDrivers = await  _context.Drivers.Where(x=> x.Created >= weekdate)
                                    .ToListAsync();
            dash.WeekDrivers = WeekDrivers.Count();
            var WeekAmount = await _context.Drivers.Where(x=> x.Created >= weekdate).Select(x=>x.Amount).ToListAsync();
            dash.WeekAmount = WeekAmount.Sum(x=>x);
            dash.WeekPrints = await _context.Drivers.Where(x=> x.PrintTime >= weekdate)
                                    .CountAsync();
            dash.AnnualDrivers = await _context.Drivers.CountAsync();
            var AnnualAmount = await _context.Drivers.Select(x=>x.Amount).ToListAsync();
            dash.AnnualAmount = AnnualAmount.Sum(x=>x);
            dash.AnnualPrints = await _context.Drivers.Where(x=>x.PrintTime != new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)).CountAsync();
            
            return Ok(dash);
        }




        


    }
}