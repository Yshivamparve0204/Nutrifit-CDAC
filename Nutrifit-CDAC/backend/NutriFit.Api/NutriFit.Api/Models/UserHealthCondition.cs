using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class UserHealthCondition
{
    [Key]
    public int UserHealthConditionId { get; set; }

    public int UserId { get; set; }
    public int HealthConditionId { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }

    [ForeignKey("HealthConditionId")]
    public HealthCondition? HealthCondition { get; set; }
}