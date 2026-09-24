using System.ComponentModel.DataAnnotations;

public class HealthCondition
{
    [Key]
    public int HealthConditionId { get; set; }

    public string? Name { get; set; }
    public string? Description { get; set; }

    public ICollection<UserHealthCondition>? UserHealthConditions { get; set; }
}