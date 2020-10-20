using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NBI.API.Models;

namespace NBI.API.Data
{
    public class DataContext : IdentityDbContext<User, Role, int , IdentityUserClaim<int>, 
        UserRole, IdentityUserLogin<int> , IdentityRoleClaim<int> , IdentityUserToken<int> >
    {

            public DataContext(DbContextOptions<DataContext> options): base(options){}

            public DbSet<Driver> Drivers { get; set; }
            public DbSet<Payment> Payments{ get; set; }
 
            protected override void OnModelCreating(ModelBuilder builder)
            {
                base.OnModelCreating(builder);

                builder.Entity<Payment>();
                
                builder.Entity<UserRole>( userRole =>
                {
                    userRole.HasKey(ur=> new{ur.UserId, ur.RoleId});

                    userRole.HasOne(ur=> ur.Role)
                            .WithMany(r=>r.UserRoles)
                            .HasForeignKey(ur=>ur.RoleId)
                            .IsRequired();

                    userRole.HasOne(ur=> ur.User)
                            .WithMany(r=>r.UserRoles)
                            .HasForeignKey(ur=>ur.UserId)
                            .IsRequired();
                });
                
            }
        
        

    }
}