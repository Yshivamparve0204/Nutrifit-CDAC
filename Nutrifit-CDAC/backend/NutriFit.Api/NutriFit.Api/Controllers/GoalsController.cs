using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NutriFit.Models;
using System.Security.Claims;

namespace NutriFit.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/goals")]
    public class GoalsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public GoalsController(AppDbContext db)
        {
            _db = db;
        }

        // =========================================
        // SET NEW GOAL (WITH AUTO CHECK)
        // =========================================
        [HttpPost("set")]
        public IActionResult SetGoal(Goal goal)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // ✅ ADMIN DELETE SAFETY CHECK
            var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
            if (validUser == null)
                return Unauthorized("User no longer exists. Please register again.");

            // Close old active goals
            var oldGoals = _db.Goals
                .Where(x => x.UserId == userId && x.Status == "in_progress")
                .ToList();

            foreach (var g in oldGoals)
                g.Status = "completed";

            goal.UserId = userId;
            goal.Status = "in_progress";
            goal.StartDate = DateTime.UtcNow.Date;

            // Sync with profile
            var profile = _db.UserProfiles.FirstOrDefault(x => x.UserId == userId);
            if (profile != null)
                profile.Goal = goal.GoalType;

            _db.Goals.Add(goal);
            _db.SaveChanges();

            // =========================================
            // ✅ AUTO COMPLETE CHECK IMMEDIATELY
            // =========================================
            var latest = _db.ProgressLogs
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.Date)
                .FirstOrDefault();

            if (latest != null)
            {
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

            return Ok(goal);
        }

        // =========================================
        // GET ACTIVE GOAL FIRST
        // =========================================
        [HttpGet("my")]
        public IActionResult MyGoal()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // ✅ ADMIN DELETE SAFETY CHECK
            var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
            if (validUser == null)
                return Unauthorized("User no longer exists. Please register again.");

            var goal = _db.Goals
                .Where(x => x.UserId == userId && x.Status == "in_progress")
                .OrderByDescending(x => x.GoalId)
                .FirstOrDefault();

            if (goal == null)
            {
                goal = _db.Goals
                    .Where(x => x.UserId == userId)
                    .OrderByDescending(x => x.GoalId)
                    .FirstOrDefault();
            }

            return Ok(goal);
        }

        // =========================================
        // CHECK GOAL STATUS
        // =========================================
        [HttpPost("check")]
        public IActionResult CheckGoal()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // ✅ ADMIN DELETE SAFETY CHECK
            var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
            if (validUser == null)
                return Unauthorized("User no longer exists. Please register again.");

            var goal = _db.Goals
                .FirstOrDefault(x => x.UserId == userId && x.Status == "in_progress");

            if (goal == null)
                return Ok(new { message = "No active goal" });

            var latest = _db.ProgressLogs
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.Date)
                .FirstOrDefault();

            if (latest == null)
                return Ok(new { message = "No progress found" });

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

            return Ok(goal);
        }

        // =========================================
        // RESET USER DATA + SAFE IDENTITY RESET
        // =========================================
        [HttpDelete("reset")]
        public IActionResult ResetAll()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // ✅ ADMIN DELETE SAFETY CHECK
            var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
            if (validUser == null)
                return Unauthorized("User no longer exists. Please register again.");

            var goals = _db.Goals.Where(x => x.UserId == userId);
            var progress = _db.ProgressLogs.Where(x => x.UserId == userId);

            _db.Goals.RemoveRange(goals);
            _db.ProgressLogs.RemoveRange(progress);

            _db.SaveChanges();

            if (!_db.Goals.Any())
            {
                _db.Database.ExecuteSqlRaw("DBCC CHECKIDENT ('Goals', RESEED, 0)");
            }

            if (!_db.ProgressLogs.Any())
            {
                _db.Database.ExecuteSqlRaw("DBCC CHECKIDENT ('ProgressLogs', RESEED, 0)");
            }

            return Ok(new
            {
                message = "All goal and progress data cleared. Identity reset if tables were empty."
            });
        }
    }
}