using System.ComponentModel.DataAnnotations;

public class DietPlanFood
{
    [Key]
    public int Id { get; set; }

    public int DietId { get; set; }
    public int FoodId { get; set; }

    [Required]
    public string MealType { get; set; } = null!;
    // breakfast, snack, lunch, dinner
}