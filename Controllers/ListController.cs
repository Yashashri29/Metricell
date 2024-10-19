using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using InterviewTest.Model;

namespace InterviewTest.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ListController : ControllerBase
    {
        private const string connectionString = "Data Source=SqliteDB.db";

        // for problem statement : Increment the field Value by 1 where the field Name begins with ‘E’ and by 10 where Name begins with ‘G’ and all others by 100 
        [HttpPost("increment")]
        public IActionResult IncrementValues()
        {
            using (var connection = new SqliteConnection(connectionString))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = @"
                    UPDATE employees 
                    SET Value = 
                        CASE 
                            WHEN Name LIKE 'E%' THEN Value + 1
                            WHEN Name LIKE 'G%' THEN Value + 10
                            ELSE Value + 100 
                        END";

                var rowsAffected = command.ExecuteNonQuery();
                return Ok(new { rowsAffected });
            }
        }

        // for problem statement : List the sum of all Values for all Names that begin with A, B or C but only present the data where the summed values are greater than or equal to 11171 
        [HttpGet("sum")]
        public IActionResult GetSum()
        {
            using (var connection = new SqliteConnection(connectionString))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = @"
                    SELECT Name, SUM(Value) as Sum
                    FROM employees 
                    WHERE Name LIKE 'A%' OR Name LIKE 'B%' OR Name LIKE 'C%'
                    GROUP BY Name
                    HAVING SUM(Value) >= 11171";

                var results = new List<SumResult>();

                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        results.Add(new SumResult
                        {
                            Name = reader.GetString(0),
                            Sum = reader.GetInt32(1)
                        });
                    }
                }

                return Ok(results);
            }
        }
    }
}
