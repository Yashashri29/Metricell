using InterviewTest.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using System.Collections.Generic;

namespace InterviewTest.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class EmployeesController : ControllerBase
    {
        [HttpGet]
        public List<Employee> Get()
        {
            var employees = new List<Employee>();

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                var queryCmd = connection.CreateCommand();
                queryCmd.CommandText = @"SELECT Name, Value FROM Employees";
                using (var reader = queryCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        employees.Add(new Employee
                        {
                            Name = reader.GetString(0),
                            Value = reader.GetInt32(1)
                        });
                    }
                }
            }

            return employees;
        }

        // POST method to add a new employee
        [HttpPost]
        public IActionResult AddEmployee([FromBody] Employee employee)
        {
            if (employee == null || string.IsNullOrEmpty(employee.Name))
            {
                return BadRequest("Invalid employee data.");
            }

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();
                var insertCmd = connection.CreateCommand();
                insertCmd.CommandText = @"INSERT INTO Employees (Name, Value) VALUES ($name, $value)";
                insertCmd.Parameters.AddWithValue("$name", employee.Name);
                insertCmd.Parameters.AddWithValue("$value", employee.Value);
                insertCmd.ExecuteNonQuery();
            }
            return CreatedAtAction(nameof(Get), new { name = employee.Name }, employee);
        }

        [HttpPut("{name}")]
        public IActionResult UpdateEmployee(string name, [FromBody] Employee employee)
        {
            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();
                var updateCmd = connection.CreateCommand();
                updateCmd.CommandText = "UPDATE Employees SET Name = $newName, Value = $value WHERE Name = $oldName";
                updateCmd.Parameters.AddWithValue("$newName", employee.Name);
                updateCmd.Parameters.AddWithValue("$value", employee.Value);
                updateCmd.Parameters.AddWithValue("$oldName", name);
                updateCmd.ExecuteNonQuery();
            }
            return NoContent();
        }

        [HttpDelete("{name}")]
        public IActionResult DeleteEmployee(string name)
        {
            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();
                var deleteCmd = connection.CreateCommand();
                deleteCmd.CommandText = "DELETE FROM Employees WHERE Name = $name";
                deleteCmd.Parameters.AddWithValue("$name", name);
                deleteCmd.ExecuteNonQuery();
            }
            return NoContent();
        }

    }
}
