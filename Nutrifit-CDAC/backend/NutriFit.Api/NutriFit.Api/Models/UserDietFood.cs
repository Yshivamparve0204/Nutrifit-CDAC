using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutriFit.Models
{
    public class UserDietFood
    {
        [Key]
        public int UserDietFoodId { get; set; }

        public int UserId { get; set; }

        public int FoodId { get; set; }

        [Required]
        public string MealType { get; set; } = string.Empty; // breakfast, snack, lunch, etc

        // Nullable navigation
        public User? User { get; set; }
        public Food? Food { get; set; }
    }
}
