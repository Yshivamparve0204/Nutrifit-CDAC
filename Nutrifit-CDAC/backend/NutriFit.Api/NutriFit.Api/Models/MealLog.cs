using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class MealLog
{
    [Key]
    public int MealId { get; set; }

    public int UserId { get; set; }
    public int FoodId { get; set; }

    [Required]
    public string MealType { get; set; } = null!;

    [Column(TypeName = "decimal(6,2)")]
    public decimal Quantity { get; set; }

    public DateTime Date { get; set; }
}