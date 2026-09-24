using System.ComponentModel.DataAnnotations;

public class WorkoutPlanDetail
{
    [Key]
    public int Id { get; set; }

    public int PlanId { get; set; }
    public int WorkoutId { get; set; }
    public string? DayName { get; set; }
    public int DurationMinutes { get; set; }

    public WorkoutPlan? WorkoutPlan { get; set; }
    public Workout? Workout { get; set; }
}