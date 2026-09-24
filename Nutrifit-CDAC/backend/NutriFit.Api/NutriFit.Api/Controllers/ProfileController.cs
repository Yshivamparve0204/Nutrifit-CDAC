using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NutriFit.Models;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProfileController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public IActionResult CreateOrUpdate(ProfileDto dto)
    {
        if (dto == null)
            return BadRequest("Profile data is required.");

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized("Invalid token.");

        int userId = int.Parse(userIdClaim);

        var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
        if (validUser == null)
            return Unauthorized("User no longer exists. Please register again.");

        decimal heightInMeter = dto.Height / 100m;
        decimal bmi = dto.Weight / (heightInMeter * heightInMeter);

        string category = bmi < 18.5m ? "low" : bmi < 25m ? "normal" : "high";

        var profile = _db.UserProfiles.FirstOrDefault(x => x.UserId == userId);

        if (profile == null)
        {
            profile = new UserProfile { UserId = userId };
            _db.UserProfiles.Add(profile);
        }

        profile.Age = dto.Age;
        profile.Gender = dto.Gender;
        profile.Height = dto.Height;
        profile.Weight = dto.Weight;
        profile.ActivityLevel = dto.ActivityLevel;
        profile.Goal = dto.Goal;
        profile.FoodPreference = dto.FoodPreference;
        profile.Bmi = bmi;
        profile.WeightCategory = category;

        _db.SaveChanges();

        UpdateUserWorkouts(userId, profile);
        UpdateUserDietFoods(userId, profile);

        return Ok(profile);
    }

    [HttpGet]
    public IActionResult GetProfile()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized("Invalid token.");

        int userId = int.Parse(userIdClaim);

        var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
        if (validUser == null)
            return Unauthorized("User no longer exists. Please register again.");

        return Ok(_db.UserProfiles.FirstOrDefault(x => x.UserId == userId));
    }

    // =============================
    // 🔹 HELPER: GENERATE USER WORKOUTS
    // =============================
    private void UpdateUserWorkouts(int userId, UserProfile profile)
    {
        if (profile == null)
            return;

        var oldWorkouts = _db.UserWorkouts.Where(x => x.UserId == userId).ToList();
        if (oldWorkouts.Any())
            _db.UserWorkouts.RemoveRange(oldWorkouts);

        int conditionId = _db.UserHealthConditions
            .Where(x => x.UserId == userId)
            .Select(x => x.HealthConditionId)
            .FirstOrDefault();

        if (conditionId == 0)
            conditionId = 1;

        var plan = _db.WorkoutPlans.FirstOrDefault(p =>
            p.Goal == profile.Goal &&
            p.WeightCategory == profile.WeightCategory &&
            p.ActivityLevel == profile.ActivityLevel &&
            p.HealthConditionId == conditionId
        ) ?? _db.WorkoutPlans.FirstOrDefault(p =>
            p.Goal == profile.Goal &&
            p.WeightCategory == profile.WeightCategory &&
            p.ActivityLevel == profile.ActivityLevel &&
            p.HealthConditionId == 1
        );

        if (plan == null)
            return;

        var planDetails = _db.WorkoutPlanDetails
            .Where(d => d.PlanId == plan.PlanId)
            .ToList();

        foreach (var d in planDetails)
        {
            _db.UserWorkouts.Add(new UserWorkout
            {
                UserId = userId,
                WorkoutId = d.WorkoutId,
                DayName = d.DayName ?? string.Empty, // ✅ FIXED (line 129 warning)
                DurationMinutes = d.DurationMinutes
            });
        }

        _db.SaveChanges();
    }

    // =============================
    // 🔹 HELPER: GENERATE USER DIET FOODS
    // =============================
    private void UpdateUserDietFoods(int userId, UserProfile profile)
    {
        if (profile == null)
            return;

        var oldDiet = _db.UserDietFoods.Where(x => x.UserId == userId).ToList();
        if (oldDiet.Any())
            _db.UserDietFoods.RemoveRange(oldDiet);

        string wc =
            profile.WeightCategory == "low" ? "underweight" :
            profile.WeightCategory == "normal" ? "normal" : "overweight";

        string goal = profile.Goal?.Trim().ToLower() ?? string.Empty;
        string foodPref = profile.FoodPreference?.Trim().ToLower() ?? string.Empty;

        if (string.IsNullOrEmpty(goal) || string.IsNullOrEmpty(foodPref))
            return;

        int conditionId = _db.UserHealthConditions
            .Where(x => x.UserId == userId)
            .Select(x => x.HealthConditionId)
            .FirstOrDefault();

        if (conditionId == 0)
            conditionId = 1;

        var plan = _db.DietPlans.FirstOrDefault(p =>
            p.Goal != null &&
            p.WeightCategory != null &&
            p.FoodPreference != null &&
            p.Goal.ToLower() == goal &&
            p.WeightCategory.ToLower() == wc &&
            p.FoodPreference.ToLower() == foodPref &&
            p.ConditionId == conditionId
        ) ?? _db.DietPlans.FirstOrDefault(p =>
            p.Goal != null &&
            p.WeightCategory != null &&
            p.FoodPreference != null &&
            p.Goal.ToLower() == goal &&
            p.WeightCategory.ToLower() == wc &&
            p.FoodPreference.ToLower() == foodPref &&
            p.ConditionId == 1
        );

        if (plan == null)
            return;

        var dietDetails = _db.DietPlanFoods
            .Where(d => d.DietId == plan.DietId)
            .ToList();

        foreach (var d in dietDetails)
        {
            _db.UserDietFoods.Add(new UserDietFood
            {
                UserId = userId,
                FoodId = d.FoodId,
                MealType = d.MealType
            });
        }

        _db.SaveChanges();
    }
}
