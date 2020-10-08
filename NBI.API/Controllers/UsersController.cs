using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NBI.API.Data;
using NBI.API.Dtos;
using NBI.API.Helper;
using NBI.API.Interfaces;
using NBI.API.Models;
using NBI.API.Repository;

namespace NBI.API.Controllers
{
    [Route("api/[controller]")]   
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IAdminMaintainRepository _repo;
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        private readonly UserManager<User> _userManager;

        public UsersController(IAdminMaintainRepository repo, DataContext context, IMapper mapper, UserManager<User> userManager)
        {
            _userManager = userManager;
            _mapper = mapper;
            _repo = repo;
            _context = context;

        }

        [Authorize(Roles="DriverAdmin,BranchAdmin,AccountAdmin,SuperAdmin")]
        [HttpGet("{id}", Name = "GetUser")]    
        public async Task<IActionResult> GetUser(int id)
        {
            
            var userDetailsFromRepo = await _repo.GetUser(id);
            if (userDetailsFromRepo == null)
            {
                return NotFound("User not Found");
            }
            var userDetailsToShow = _mapper.Map<UserForDisplayDetailDto>(userDetailsFromRepo);
            return Ok(userDetailsToShow);

        }

        [Authorize(Roles="DriverAdmin,BranchAdmin,AccountAdmin,SuperAdmin")]
        [HttpGet("branchDetails",Name = "GetUsers")]    
        public async Task<IActionResult> GetBranchDetails()
        {
            
            var userList = await (from user in _context.Users
                                  orderby user.UserName
                                  select new  
                                  {
                                      Id = user.Id,
                                      UserName = user.UserName,
                                      Email = user.Email,
                                      Name = user.Name,
                                      City = user.City,
                                      Count = _context.Drivers.Where(x=>x.BranchVisited==user.City).Count(),
                                      Roles = (from userRole in user.UserRoles
                                               join role in _context.Roles
                                               on userRole.RoleId
                                               equals role.Id
                                               select role.Name).Count()
                                  }).ToListAsync();

            if(userList!=null)
            {
                var users = userList.Where(x=>x.Roles==3).ToList(); 
                return Ok(users);
            }

            return BadRequest("No users or Error");
        }

        [Authorize(Roles="DriverAdmin,BranchAdmin,AccountAdmin,SuperAdmin")]
        [HttpGet("getcitylist", Name = "GetCity")]    
        public async Task<IActionResult> GetCities()
        {
            var listOfCities = await _context.Users.Select(x=>x.City).ToListAsync();
            if(listOfCities!=null)
            {
                return Ok(listOfCities);
            }
            return NotFound();
            
        }


        [Authorize(Roles="DriverAdmin,BranchAdmin,AccountAdmin,SuperAdmin")]
        [HttpGet("getAllUsers")]
        public async Task<IActionResult> GetAllUsers([FromQuery] UserParams userParams)
        {
         
            var userList = await (from user in _context.Users
                                    orderby user.UserName
                                    select new  
                                    {
                                        Id = user.Id,
                                        UserName = user.UserName,
                                        Email = user.Email,
                                        Name = user.Name,
                                        City = user.City,
                                        Roles = (from userRole in user.UserRoles
                                                join role in _context.Roles
                                                on userRole.RoleId
                                                equals role.Id
                                                select role.Name).Count()
                                    }).ToListAsync();



            var users = userList.ToList();
            if(userParams.UserType=="ALL")
            {
                users = userList.ToList();
            }
            if(userParams.Branch=="ALL")
            {
                users = userList.ToList();
            }      
            if(userParams.Branch !=null && userParams.Branch!="ALL") 
            {
                users = users.Where(x=>x.City==userParams.Branch).ToList();
            }            
            if(userParams.UserType=="4")
            {
                users = userList.Where(x=>x.Roles==4).ToList(); 
            }

            if(userParams.UserType=="3")
            {
                users = userList.Where(x=>x.Roles==3).ToList(); 
            }
            
            if(userParams.UserType=="2")
            {
                users = userList.Where(x=>x.Roles==2).ToList(); 
            }

            if(userParams.UserType=="1")
            {
                users = userList.Where(x=>x.Roles==1).ToList(); 
            }
            
            return Ok(users);
        }

        [Authorize(Roles="DriverAdmin,BranchAdmin,AccountAdmin,SuperAdmin")]
        [HttpPut("{id}")]    
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateAdminDto userForUpdateAdminDto)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            if(id!=currentUserId)
            {
                return Unauthorized();
            }
            var userFromRepo = await _repo.GetUser(id);

            _mapper.Map(userForUpdateAdminDto, userFromRepo);
            
            if (await  _repo.SaveAll()){

                var userToReturn = _mapper.Map<UserForDisplayDetailDto>(userFromRepo);
                return CreatedAtRoute("GetUser", new { Controller = "Users", id = userFromRepo.Id }, userToReturn);

            }
            return BadRequest($"Changes not made for {id} ");
        }

       [Authorize(Roles="DriverAdmin,BranchAdmin,AccountAdmin,SuperAdmin")]
        [HttpGet("usersWithRoles", Name = "GetUsersWithRoles")]
        public async Task<IActionResult> GetUsersWithRolesHttp()
        {
            var users = await _repo.GetUsersWithRoles();
            return Ok(users);
        }


       [Authorize(Roles="DriverAdmin,BranchAdmin,AccountAdmin,SuperAdmin")]
        [HttpGet("userWithRole/{id}", Name = "GetUserWithRole")]
        public async Task<IActionResult> GetUserWithRoleHttp(int id)
        {
            var users = await _repo.GetUserWithRole(id);
            return Ok(users);
        }

       [Authorize(Roles="DriverAdmin,BranchAdmin,AccountAdmin,SuperAdmin")]
        [HttpDelete("DeleteUser/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            if(id==currentUserId)
            {
                return BadRequest("You cannot delete your own profile");
            }
            var userFromRepo = await _repo.GetUser(id);
            System.Console.WriteLine(userFromRepo);
            if(userFromRepo!=null)
            {
            var users = await _userManager.DeleteAsync(userFromRepo);
            return Ok();
            }
            return BadRequest("User Not found");
            
        }
    }
}