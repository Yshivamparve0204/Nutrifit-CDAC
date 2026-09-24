using System.ComponentModel.DataAnnotations;

public class WorkoutPlan
{
    [Key]
    public int PlanId { get; set; }

    public string? Goal { get; set; }
    public string? WeightCategory { get; set; }
    public string? ActivityLevel { get; set; }
    public int HealthConditionId { get; set; }
    public string? MaxIntensity { get; set; }

    public ICollection<WorkoutPlanDetail>? WorkoutPlanDetails { get; set; }
}