using System.ComponentModel.DataAnnotations;

public class Workout
{
    [Key]
    public int WorkoutId { get; set; }

    public string? WorkoutName { get; set; }
    public string? WorkoutType { get; set; }
    public string? Intensity { get; set; }
    public float CaloriesBurnedPerMin { get; set; }
    public string? HealthSafe { get; set; }
}