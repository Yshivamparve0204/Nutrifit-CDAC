using System.ComponentModel.DataAnnotations;

public class DietPlan
{
    [Key]
    public int DietId { get; set; }

    [Required]
    public string Goal { get; set; } = null!;
    // Weight Loss, Muscle Gain, Fitness

    public int ConditionId { get; set; }

    [Required]
    public string FoodPreference { get; set; } = null!;
    // vegan, vegetarian, non_vegetarian

    [Required]
    public string WeightCategory { get; set; } = null!;
    // Underweight, Normal, Overweight
}