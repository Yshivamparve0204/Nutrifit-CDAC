using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize(Roles = "admin")]
[ApiController]
[Route("api/admin/health")]
public class HealthConditionAdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public HealthConditionAdminController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_db.HealthConditions.ToList());
    }

    [HttpPost]
    public IActionResult Add(HealthCondition hc)
    {
        _db.HealthConditions.Add(hc);
        _db.SaveChanges();
        return Ok(hc);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, HealthCondition hc)
    {
        var dbHc = _db.HealthConditions.Find(id);
        if (dbHc == null) return NotFound();

        dbHc.Name = hc.Name;
        dbHc.Description = hc.Description;
        _db.SaveChanges();

        return Ok(dbHc);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var hc = _db.HealthConditions.Find(id);
        if (hc == null) return NotFound();

        _db.HealthConditions.Remove(hc);
        _db.SaveChanges();

        return Ok("Health condition deleted");
    }
}