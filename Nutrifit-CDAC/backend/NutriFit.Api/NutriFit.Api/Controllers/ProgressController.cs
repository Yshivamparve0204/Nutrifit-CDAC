using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutriFit.Models;
using System.Security.Claims;

namespace NutriFit.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/progress")]
    public class ProgressController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProgressController(AppDbContext db)
        {
            _db = db;
        }

        // =========================================
        // ADD OR UPDATE TODAY PROGRESS
        // =========================================
        [HttpPost("add")]
        public IActionResult AddProgress(decimal weight)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // ✅ ADMIN DELETE SAFETY CHECK
            var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
            if (validUser == null)
                return Unauthorized("User no longer exists. Please register again.");

            var profile = _db.UserProfiles.FirstOrDefault(x => x.UserId == userId);
            if (profile == null)
                return BadRequest("Profile not found");

            decimal heightMeter = profile.Height / 100m;
            decimal bmiDecimal = weight / (heightMeter * heightMeter);
            double bmi = Math.Round((double)bmiDecimal, 2);

            string category = bmi < 18.5 ? "low" : bmi < 25 ? "normal" : "high";

            var today = DateTime.UtcNow.Date;

            var log = _db.ProgressLogs
                .FirstOrDefault(x => x.UserId == userId && x.Date == today);

            if (log == null)
            {
                log = new ProgressLog
                {
                    UserId = userId,
                    Weight = (double)weight,
                    Bmi = bmi,
                    WeightCategory = category,
                    Date = today
                };
                _db.ProgressLogs.Add(log);
            }
            else
            {
                log.Weight = (double)weight;
                log.Bmi = bmi;
                log.WeightCategory = category;
            }

            profile.Weight = weight;
            profile.Bmi = (decimal)bmi;
            profile.WeightCategory = category;

            _db.SaveChanges();

            // Auto goal check + override logic
            CheckGoalAuto(userId);
            OverrideWorkoutAndDiet(userId, category);

            return Ok(new { message = "Progress saved", bmi, category });
        }

        // =========================================
        // GET FULL PROGRESS HISTORY
        // =========================================
        [HttpGet("my")]
        public IActionResult MyProgress()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // ✅ ADMIN DELETE SAFETY CHECK
            var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
            if (validUser == null)
                return Unauthorized("User no longer exists. Please register again.");

            var data = _db.ProgressLogs
                .Where(x => x.UserId == userId)
                .OrderBy(x => x.Date)
                .Select(x => new
                {
                    x.Date,
                    x.Weight,
                    x.Bmi,
                    x.WeightCategory
                })
                .ToList();

            return Ok(data);
        }

        // =========================================
        // GET LATEST PROGRESS
        // =========================================
        [HttpGet("latest")]
        public IActionResult Latest()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // ✅ ADMIN DELETE SAFETY CHECK
            var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
            if (validUser == null)
                return Unauthorized("User no longer exists. Please register again.");

            var data = _db.ProgressLogs
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.Date)
                .FirstOrDefault();

            return Ok(data);
        }

        // =========================================
        // AUTO GOAL CHECK
        // =========================================
        private void CheckGoalAuto(int userId)
        {
            var goal = _db.Goals.FirstOrDefault(x => x.UserId == userId && x.Status == "in_progress");
            if (goal == null) return;

            var latest = _db.ProgressLogs
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.Date)
                .FirstOrDefault();

            if (latest == null) return;

            bool completed = false;

            if (goal.GoalType == "weight_loss" && latest.Weight <= goal.TargetValue)
                completed = true;

            if (goal.GoalType == "muscle_gain" && latest.Weight >= goal.TargetValue)
                completed = true;

            if (goal.GoalType == "fitness" && latest.Bmi >= 18.5 && latest.Bmi < 25)
                completed = true;

            if (completed)
            {
                goal.Status = "completed";
                _db.SaveChanges();
            }
        }

        // =========================================
        // AUTO WORKOUT & DIET OVERRIDE
        // =========================================
        private void OverrideWorkoutAndDiet(int userId, string category)
        {
            var goal = _db.Goals.FirstOrDefault(x => x.UserId == userId && x.Status == "in_progress");
            if (goal == null) return;

            var profile = _db.UserProfiles.First(x => x.UserId == userId);

            string dietWeightCategory =
                category == "low" ? "Underweight" :
                category == "normal" ? "Normal" : "Overweight";

            var workout = _db.WorkoutPlans.FirstOrDefault(x =>
                x.Goal == goal.GoalType &&
                x.ActivityLevel == profile.ActivityLevel &&
                x.WeightCategory == category);

            var diet = _db.DietPlans.FirstOrDefault(x =>
                x.Goal == goal.GoalType &&
                x.FoodPreference == profile.FoodPreference &&
                x.WeightCategory == dietWeightCategory);

            // connect workout & diet to active user plan table if needed
        }
    }
}