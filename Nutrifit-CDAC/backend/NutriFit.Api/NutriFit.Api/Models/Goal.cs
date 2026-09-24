using System.ComponentModel.DataAnnotations;

namespace NutriFit.Models
{
    public class Goal
    {
        [Key]
        public int GoalId { get; set; }

        public int UserId { get; set; }

        [Required]
        public string GoalType { get; set; } = string.Empty;
        // muscle_gain, fitness, flexibility

        public double TargetValue { get; set; }

        public DateTime StartDate { get; set; } = DateTime.UtcNow.Date;
        public DateTime EndDate { get; set; }

        public string Status { get; set; } = "in_progress";
        // in_progress, completed

        // ✅ FIX: nullable navigation
        public User? User { get; set; }
    }
}