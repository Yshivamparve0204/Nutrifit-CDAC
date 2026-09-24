using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Food
{
    [Key]
    public int FoodId { get; set; }

    [Required]
    public string FoodName { get; set; } = null!;

    [Required]
    public string FoodType { get; set; } = null!;
    // vegan, vegetarian, non_vegetarian

    [Column(TypeName = "decimal(6,2)")]
    public decimal Calories { get; set; }

    [Column(TypeName = "decimal(6,2)")]
    public decimal Protein { get; set; }

    [Column(TypeName = "decimal(6,2)")]
    public decimal Carbs { get; set; }

    [Column(TypeName = "decimal(6,2)")]
    public decimal Fat { get; set; }

    [Required]
    public string GlycemicIndex { get; set; } = null!;
    // low, medium, high

    [Column(TypeName = "decimal(6,2)")]
    public decimal SodiumContent { get; set; }
}