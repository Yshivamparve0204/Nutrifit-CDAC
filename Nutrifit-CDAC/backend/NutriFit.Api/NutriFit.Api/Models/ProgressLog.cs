using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutriFit.Models
{
    public class ProgressLog
    {
        [Key]
        public int ProgressId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Column(TypeName = "float")]
        public double Weight { get; set; }

        [Column(TypeName = "float")]
        public double Bmi { get; set; }

        [Required]
        public string WeightCategory { get; set; } = "normal";
        // low, normal, high

        public DateTime Date { get; set; } = DateTime.UtcNow.Date;

        // ✅ FIX: nullable navigation
        public User? User { get; set; }
    }
}