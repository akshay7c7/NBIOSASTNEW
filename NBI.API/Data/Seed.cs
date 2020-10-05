using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using NBI.API.Models;
using Newtonsoft.Json;

namespace NBI.API.Data
{
    public class Seed
    {
        public static void SeedUsers(UserManager<User> userManager, RoleManager<Role> roleManager)
        {
            if (!userManager.Users.Any())
            {
                var userData = System.IO.File.ReadAllText("Data/UserSeedData.json");
                var users = JsonConvert.DeserializeObject<List<User>>(userData);

                var roles = new List<Role>
                {
                    new Role{Name = "DriverAdmin"},
                    new Role{Name = "AccountAdmin"},
                    new Role{Name = "BranchAdmin"},
                    new Role{Name = "SuperAdmin"}
                    
                };

                foreach (var role in roles)
                {
                    roleManager.CreateAsync(role).Wait();
                }

                foreach (var user in users)
                {
                    userManager.CreateAsync(user, "password").Wait();
                    userManager.AddToRoleAsync(user, "DriverAdmin").Wait();
                }

                var SuperAdminUser = new User
                {
                    UserName = "Super1"
                };
               
                IdentityResult result1 = userManager.CreateAsync(SuperAdminUser, "password").Result;
               
                

                if (result1.Succeeded)
                {
                    var admin = userManager.FindByNameAsync("Super1").Result;
                    userManager.AddToRolesAsync(admin, new[] {"DriverAdmin","AccountAdmin","BranchAdmin","SuperAdmin"}).Wait();
                }
               

            }
        }
    }
}