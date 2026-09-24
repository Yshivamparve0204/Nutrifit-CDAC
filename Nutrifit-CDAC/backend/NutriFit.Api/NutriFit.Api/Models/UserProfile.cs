using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class UserProfile
{
    [Key]
    public int ProfileId { get; set; }

    public int UserId { get; set; }

    public int Age { get; set; }
    public string? Gender { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Height { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Weight { get; set; }

    public string? ActivityLevel { get; set; }
    public string? Goal { get; set; }
    public string? FoodPreference { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Bmi { get; set; }

    public string? WeightCategory { get; set; }

    public User? User { get; set; }
}