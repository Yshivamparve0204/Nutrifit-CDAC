using Microsoft.EntityFrameworkCore;
using NutriFit.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ==============================
    // MODULE 1 - USERS & ADMINS
    // ==============================
    public DbSet<User> Users => Set<User>();
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();

    // ==============================
    // MODULE 2 - HEALTH
    // ==============================
    public DbSet<HealthCondition> HealthConditions => Set<HealthCondition>();
    public DbSet<UserHealthCondition> UserHealthConditions => Set<UserHealthCondition>();

    // ==============================
    // MODULE 3 - WORKOUT
    // ==============================
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<WorkoutPlan> WorkoutPlans => Set<WorkoutPlan>();
    public DbSet<WorkoutPlanDetail> WorkoutPlanDetails => Set<WorkoutPlanDetail>();

    // ✅ New: User Assigned Workouts
    public DbSet<UserWorkout> UserWorkouts { get; set; }

    // ==============================
    // MODULE 4 - DIET
    // ==============================
    public DbSet<Food> Foods { get; set; }
    public DbSet<DietPlan> DietPlans { get; set; }
    public DbSet<DietPlanFood> DietPlanFoods { get; set; }
    public DbSet<MealLog> MealLogs { get; set; }

    // ✅ New: User Assigned Diet Foods
    public DbSet<UserDietFood> UserDietFoods { get; set; }

    // ==============================
    // MODULE 5 - PROGRESS & GOALS
    // ==============================
    public DbSet<ProgressLog> ProgressLogs { get; set; }
    public DbSet<Goal> Goals { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==============================
        // PROGRESS & GOALS
        // ==============================
        modelBuilder.Entity<ProgressLog>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Goal>()
            .HasOne(g => g.User)
            .WithMany()
            .HasForeignKey(g => g.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ==============================
        // USER WORKOUT
        // ==============================
        modelBuilder.Entity<UserWorkout>()
            .HasOne(uw => uw.User)
            .WithMany()
            .HasForeignKey(uw => uw.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserWorkout>()
            .HasOne(uw => uw.Workout)
            .WithMany()
            .HasForeignKey(uw => uw.WorkoutId)
            .OnDelete(DeleteBehavior.Cascade);

        // ==============================
        // USER DIET FOOD
        // ==============================
        modelBuilder.Entity<UserDietFood>()
            .HasOne(ud => ud.User)
            .WithMany()
            .HasForeignKey(ud => ud.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserDietFood>()
            .HasOne(ud => ud.Food)
            .WithMany()
            .HasForeignKey(ud => ud.FoodId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
