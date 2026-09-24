using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Authorize(Roles = "admin")]
[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    // ======================================
    // ✅ GET ALL USERS
    // ======================================
    [HttpGet("users")]
    public IActionResult GetUsers()
    {
        var users = _db.Users
            .Select(u => new
            {
                u.UserId,
                u.Name,
                u.Email,
                u.CreatedAt
            }).ToList();

        return Ok(users);
    }

    // ======================================
    // ✅ GET FULL USER DASHBOARD (ADMIN VIEW)
    // ======================================
    [HttpGet("users/{id}")]
    public IActionResult GetUserDetails(int id)
    {
        var user = _db.Users.FirstOrDefault(x => x.UserId == id);
        if (user == null)
            return NotFound("User not found");

        var profile = _db.UserProfiles.FirstOrDefault(x => x.UserId == id);

        // ============================
        // HEALTH CONDITIONS
        // ============================
        var healthIssues =
            (from uh in _db.UserHealthConditions
             join h in _db.HealthConditions on uh.HealthConditionId equals h.HealthConditionId
             where uh.UserId == id
             select new
             {
                 h.HealthConditionId,
                 h.Name,
                 h.Description
             }).ToList();

        // ============================
        // ACTIVE / LAST GOAL
        // ============================
        var activeGoal = _db.Goals
            .Where(x => x.UserId == id)
            .OrderByDescending(x => x.GoalId)
            .FirstOrDefault();

        // ============================
        // PROGRESS HISTORY
        // ============================
        var progressHistory = _db.ProgressLogs
            .Where(x => x.UserId == id)
            .OrderBy(x => x.Date)
            .Select(x => new
            {
                x.Date,
                x.Weight,
                x.Bmi,
                x.WeightCategory
            }).ToList();

        // ============================
        // WORKOUT PLAN
        // ============================
        List<object> workoutPlan = new();

        var userWorkoutDetails = (from uw in _db.UserWorkouts
                                  join w in _db.Workouts on uw.WorkoutId equals w.WorkoutId
                                  where uw.UserId == id
                                  orderby
                                      uw.DayName == "Monday" ? 1 :
                                      uw.DayName == "Tuesday" ? 2 :
                                      uw.DayName == "Wednesday" ? 3 :
                                      uw.DayName == "Thursday" ? 4 :
                                      uw.DayName == "Friday" ? 5 :
                                      uw.DayName == "Saturday" ? 6 : 7
                                  select new
                                  {
                                      uw.DayName,
                                      w.WorkoutName,
                                      w.WorkoutType,
                                      w.Intensity,
                                      uw.DurationMinutes
                                  }).ToList();

        if (userWorkoutDetails.Any())
        {
            workoutPlan = userWorkoutDetails.Cast<object>().ToList();
        }
        else if (profile != null &&
                 !string.IsNullOrEmpty(profile.Goal) &&
                 !string.IsNullOrEmpty(profile.WeightCategory) &&
                 !string.IsNullOrEmpty(profile.ActivityLevel))
        {
            int conditionId = _db.UserHealthConditions
                .Where(x => x.UserId == id)
                .Select(x => x.HealthConditionId)
                .FirstOrDefault();
            if (conditionId == 0) conditionId = 1;

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

            if (plan != null)
            {
                workoutPlan =
                    (from d in _db.WorkoutPlanDetails
                     join w in _db.Workouts on d.WorkoutId equals w.WorkoutId
                     where d.PlanId == plan.PlanId
                     orderby
                        d.DayName == "Monday" ? 1 :
                        d.DayName == "Tuesday" ? 2 :
                        d.DayName == "Wednesday" ? 3 :
                        d.DayName == "Thursday" ? 4 :
                        d.DayName == "Friday" ? 5 :
                        d.DayName == "Saturday" ? 6 : 7
                     select new
                     {
                         d.DayName,
                         w.WorkoutName,
                         w.WorkoutType,
                         w.Intensity,
                         d.DurationMinutes
                     }).Cast<object>().ToList();
            }
        }

        // ============================
        // DIET PLAN
        // ============================
        List<object> dietPlan = new();

        var userDietDetails = (from ud in _db.UserDietFoods
                               join f in _db.Foods on ud.FoodId equals f.FoodId
                               where ud.UserId == id
                               orderby
                                   ud.MealType == "breakfast" ? 1 :
                                   ud.MealType == "snack" ? 2 :
                                   ud.MealType == "lunch" ? 3 :
                                   ud.MealType == "snack2" ? 4 : 5
                               select new
                               {
                                   ud.MealType,
                                   f.FoodName,
                                   f.Calories,
                                   f.Protein,
                                   f.Carbs,
                                   f.Fat
                               }).ToList();

        if (userDietDetails.Any())
        {
            dietPlan = userDietDetails.Cast<object>().ToList();
        }
        else if (profile != null &&
                 !string.IsNullOrEmpty(profile.Goal) &&
                 !string.IsNullOrEmpty(profile.FoodPreference))
        {
            string wc =
                profile.WeightCategory == "low" ? "underweight" :
                profile.WeightCategory == "normal" ? "normal" : "overweight";

            string goal = profile.Goal.ToLower();
            string foodPref = profile.FoodPreference.ToLower();

            int conditionId = _db.UserHealthConditions
                .Where(x => x.UserId == id)
                .Select(x => x.HealthConditionId)
                .FirstOrDefault();
            if (conditionId == 0) conditionId = 1;

            var plan = _db.DietPlans.FirstOrDefault(p =>
                p.Goal.ToLower() == goal &&
                p.WeightCategory.ToLower() == wc &&
                p.FoodPreference.ToLower() == foodPref &&
                p.ConditionId == conditionId
            ) ?? _db.DietPlans.FirstOrDefault(p =>
                p.Goal.ToLower() == goal &&
                p.WeightCategory.ToLower() == wc &&
                p.FoodPreference.ToLower() == foodPref &&
                p.ConditionId == 1
            );

            if (plan != null)
            {
                dietPlan =
                    (from d in _db.DietPlanFoods
                     join f in _db.Foods on d.FoodId equals f.FoodId
                     where d.DietId == plan.DietId
                     orderby
                        d.MealType == "breakfast" ? 1 :
                        d.MealType == "snack" ? 2 :
                        d.MealType == "lunch" ? 3 :
                        d.MealType == "snack2" ? 4 : 5
                     select new
                     {
                         d.MealType,
                         f.FoodName,
                         f.Calories,
                         f.Protein,
                         f.Carbs,
                         f.Fat
                     }).Cast<object>().ToList();
            }
        }

        // ============================
        // RETURN USER DATA
        // ============================
        return Ok(new
        {
            user,
            profile,
            healthIssues,
            activeGoal,
            progressHistory,
            workoutPlan,
            dietPlan
        });
    }

    // ======================================
    // ✅ DELETE USER AND ALL RELATED DATA
    // ======================================
    [HttpDelete("users/{id}")]
    public IActionResult DeleteUser(int id)
    {
        var user = _db.Users.FirstOrDefault(u => u.UserId == id);
        if (user == null)
            return NotFound("User not found");

        // -----------------------------
        // Delete all user-related tables
        // -----------------------------
        _db.ProgressLogs.RemoveRange(_db.ProgressLogs.Where(x => x.UserId == id));
        _db.Goals.RemoveRange(_db.Goals.Where(x => x.UserId == id));
        _db.UserWorkouts.RemoveRange(_db.UserWorkouts.Where(x => x.UserId == id));
        _db.UserDietFoods.RemoveRange(_db.UserDietFoods.Where(x => x.UserId == id));
        _db.MealLogs.RemoveRange(_db.MealLogs.Where(x => x.UserId == id));
        _db.UserHealthConditions.RemoveRange(_db.UserHealthConditions.Where(x => x.UserId == id));

        var profile = _db.UserProfiles.FirstOrDefault(x => x.UserId == id);
        if (profile != null) _db.UserProfiles.Remove(profile);

        _db.Users.Remove(user);

        _db.SaveChanges();

        return Ok(new { message = "User and all related data deleted successfully" });
    }
}
