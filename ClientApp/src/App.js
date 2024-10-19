import React, { Component } from 'react';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            employees: [],
            sumResults: [],
            loading: true,
            error: null,
            newEmployee: { name: '', value: 0 },
            editEmployee: { name: '', value: 0 }, 
            editing: false, 
        };
    }

    componentDidMount() {
        this.fetchEmployees();
    }

    fetchEmployees = async () => {
        try {
            const response = await fetch('/employees');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.setState({ employees: data, loading: false });
        } catch (error) {
            this.setState({ error: error.message, loading: false });
        }
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            newEmployee: {
                ...this.state.newEmployee,
                [name]: name === 'value' ? parseInt(value, 10) : value,
            },
        });
    };

    handleEditInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            editEmployee: {
                ...this.state.editEmployee,
                [name]: name === 'value' ? parseInt(value, 10) : value,
            },
        });
    };

    //method to add new employee
    handleAddEmployee = async (e) => {
        e.preventDefault(); 

        const { newEmployee } = this.state; 

        try {
            const response = await fetch('/employees', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEmployee), 
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.fetchEmployees(); // loading new employee list after new employee gets added
            this.setState({ newEmployee: { name: '', value: 0 } });
        } catch (error) {
            console.error('Error adding employee:', error); // displays error message in console
        }
    };

    //method to delete an existing employee
    handleDeleteEmployee = async (name) => {
        try {
            await fetch(`/employees/${name}`, { method: 'DELETE' });
            this.fetchEmployees(); 
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    //method to update employee's details
    handleEditEmployee = async (name) => {
        const employee = this.state.employees.find(emp => emp.name === name);
        this.setState({ editEmployee: { ...employee }, editing: true }); 
    };

    //method to handle updating employee details
    handleEditSubmit = async (e) => {
        e.preventDefault();
        const { editEmployee } = this.state;

        try {
            const response = await fetch(`/employees/${editEmployee.name}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editEmployee),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.fetchEmployees(); 
            this.setState({ editing: false, editEmployee: { name: '', value: 0 } }); 
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    handleIncrementValues = async () => {
        try {
            await fetch('/list/increment', { method: 'POST' });
            this.fetchEmployees(); 
        } catch (error) {
            console.error('Error incrementing values:', error);
        }
    };

    // method to get sum of values for A, B, C names
    handleGetSum = async () => {
        try {
            const response = await fetch('/list/sum'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            this.setState({ sumResults: result });  
        } catch (error) {
            console.error('Error fetching sum:', error);
        }
    };

    render() {
        const { employees, loading, error, newEmployee, editEmployee, editing, sumResults } = this.state;  

        if (loading) {
            return <div>Loading...</div>;
        }

        if (error) {
            return <div>Error: {error}</div>;
        }

        return (
            <div>
                <h1>Employee List</h1>
                <ul>
                    {employees.map((employee, index) => (
                        <li key={index}>
                            {employee.name}: {employee.value}
                            <button onClick={() => this.handleDeleteEmployee(employee.name)}>Delete</button>
                            <button onClick={() => this.handleEditEmployee(employee.name)}>Edit</button>
                        </li>
                    ))}
                </ul>

                <h2>Add New Employee</h2>
                <form onSubmit={this.handleAddEmployee}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={newEmployee.name}
                        onChange={this.handleInputChange}
                        required
                    />
                    <input
                        type="number"
                        name="value"
                        placeholder="Value"
                        value={newEmployee.value}
                        onChange={this.handleInputChange}
                        required
                    />
                    <button type="submit">Add Employee</button>
                </form>

                {editing && (  
                    <div>
                        <h2>Edit Employee</h2>
                        <form onSubmit={this.handleEditSubmit}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={editEmployee.name}
                                onChange={this.handleEditInputChange}
                                required
                            />
                            <input
                                type="number"
                                name="value"
                                placeholder="Value"
                                value={editEmployee.value}
                                onChange={this.handleEditInputChange}
                                required
                            />
                            <button type="submit">Update Employee</button>
                            <button onClick={() => this.setState({ editing: false })}>Cancel</button>
                        </form>
                    </div>
                )}

                <h2>Actions</h2>
                <button onClick={this.handleIncrementValues}>Increment Values</button>
                <button onClick={this.handleGetSum}>Get Sum of A, B, C Names</button>

                {sumResults.length > 0 ? (  
                    <div>
                        <h2>Sum Results (A, B, C Names with Value >= 11171)</h2>
                        <ul>
                            {sumResults.map((result, index) => (
                                <li key={index}>
                                    {result.name}: {result.sum}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div>
                        <h2>if the values for names that begin with A, B, or C where the summed values are greater than or equal to 11171 present in the list then only it will print here</h2>
                    </div>
                )}
            </div>
        );
    }
}
