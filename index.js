const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");



const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "employment_DB"
});

//Connects and initializes the program
connection.connect(function (err) {
    if (err) throw err;
})

console.log("Welcome to the employee management system!");
nextTask();

function nextTask() {
    inquirer
        .prompt(
            {
                message: "What would you like to do?",
                type: "list",
                name: "next",
                choices: ["Add", "View", "Update", "End"]
            }
        ).then(function (res) {
            switch (res.next) {
                case "Add":
                    console.log("Now adding...");
                    adding();
                    break;
                case "View":
                    viewing();
                    break;
                case "Update":
                    console.log("Now updating...");
                    updating();
                    break;

                default:
                    console.log("Goodbye!")
                    connection.end();
                    break;
            }
        }).catch(function (err) {
            if (err) throw err;
        })
}

function backToStart() {
    console.log("This command is currently in beta. Please choose something else for now.");
    nextTask();
}

function adding() {
    inquirer
        .prompt(
            {
                message: "What would you like to add?",
                type: "list",
                name: "next",
                choices: ["Departments", "Roles", "Employees", "Back"]
            }
        ).then(function (res) {
            switch (res.next) {
                case "Departments":
                    console.log("Now adding departments...");
                    backToStart();
                    break;
                case "Roles":
                    console.log("Now adding roles...");
                    backToStart();
                    break;
                case "Employees":
                    console.log("Now adding employees...");
                    backToStart();
                    break;

                default:
                    nextTask();
                    break;
            }
        }).catch(function (err) {
            if (err) throw err;
        })
}

function viewing() {
    inquirer
        .prompt(
            {
                message: "What would you like to view?",
                type: "list",
                name: "next",
                choices: ["Departments", "Roles", "Employees", "Back"]
            }
        ).then(function (res) {

            switch (res.next) {
                case "Departments":
                    console.log("Now viewing all departments:");
                    connection.query("SELECT name AS 'Departments' FROM departments", function (err, result) {
                        console.table(result);
                        nextTask();
                    })

                    break;
                case "Roles":
                    console.log("Now viewing all roles:");
                    connection.query(`SELECT title AS "Job Title",salary AS "Salary (USD)" FROM roles`, function (err, result) {
                        console.table(result);
                        nextTask();
                    })

                    break;
                case "Employees":

                    employeesSort();
                    break;

                default:
                    nextTask();
                    break;
            }
        }).catch(function (err) {
            if (err) throw err;
        })
}

function employeesSort() {
    inquirer
        .prompt(
            {
                type: "list",
                message: "Would you like to sort by any variables?",
                name: "viewOptions",
                choices: ["Department", "Role", "Manager", "All","Back"]
            }).then(async function (response) {
                let sortList;
                switch (response.viewOptions) {
                    case "All":
                        console.table(await niceEmployeeDisplay());
                        nextTask();
                        break;
                    case "Department":
                        sortList = await indeterminateList("name", "departments");
                        sortList.push("Back");
                        inquirer.prompt({
                            type: "list",
                            message: "Please choose a department by which you want to view employees.",
                            choices: sortList,
                            name: "dept"
                        }).then(async function (response) {
                                if (response.dept === "Back") employeesSort();
                                else {
                                    const display = await niceEmployeeDisplay("departments.name", response.dept);
                                    if (display.length) console.table(display);
                                    nextTask();
                                }
                            });

                        break;

                    case "Role":
                        sortList = await indeterminateList("title", "roles");
                        sortList.push("Back");
                        inquirer.prompt({
                            type: "list",
                            message: "Please choose a role by which you want to view employees.",
                            choices: sortList,
                            name: "dept"
                        }).then(async function (response) {
                                if (response.dept === "Back") employeesSort();
                                else {
                                    const display = await niceEmployeeDisplay("roles.title", response.dept);
                                    console.table(display);
                                    nextTask();
                                }
                            });

                        break;
                    case "Manager":
                        sortList = await indeterminateList(`concat(managers.first_name, ' ', 
                        managers.last_name)`, "managers");
                        sortList.push("Back");
                        inquirer.prompt({
                            type: "list",
                            message: "Please choose a manager by which you want to view employees.",
                            choices: sortList,
                            name: "dept"
                        }).then(async function (response) {
                            if (response.dept === "Back") employeesSort();
                            else {
                                const display = await niceEmployeeDisplay("concat(managers.first_name, ' ', managers.last_name)", response.dept);
                                console.table(display);
                                nextTask();
                            }
                        });

                        break;
                    default:
                        viewing();;
                        break;
                }
            })
}

async function niceEmployeeDisplay(database, selector) {
    return new Promise((resolve, reject) => {
        let query = `SELECT employees.first_name AS "First Name",employees.last_name   AS "Last Name",title AS "Job Title",salary AS "Salary (USD)", departments.name AS "Department",concat(managers.first_name, ' ', managers.last_name) AS "Manager" FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN managers ON employees.manager_id = managers.id`;
        if (selector && database) {

            query += ` WHERE ${database} = "${selector}";`
            // query += ` WHERE ? = ? `
            // console.log(query);
            // connection.query(query, [database, selector], function (err, res) {
            connection.query(query, [database, selector], function (err, res) {

                if (err) reject(err);
                if (res.length === 0) resolve("No results under these search parameters.");
                // console.log(res);
                resolve(res);
            })
        } else {
            connection.query(query, function (err, res) {
                if (err) reject(err);
                if (res.length === 0) resolve("No results under these search parameters.");

                resolve(res);
            })
        }
    })
}

async function updating() {

    const employeeList = await indeterminateList(`concat(first_name, ' ', last_name)`, 'employees');
    employeeList.push("Back")
    inquirer
        .prompt(
            {
                message: "Which employee would you like to update?",
                type: "list",
                name: "employeeUpdate",
                choices: employeeList
            }
        ).then(function (res) {

            if (res.employeeUpdate === "Back") nextTask();
            else {
                console.log(`Now updating ${res.employeeUpdate}`);
                updateHow(res.employeeUpdate);
            }

        }).catch(function (err) {
            if (err) throw err;
        });



}

function updateHow(ans) {
    inquirer
        .prompt(
            {
                message: "What would you like to update?",
                type: "list",
                name: "updateList",
                choices: ["Role", "Manager", "First Name", "Last Name", "Back"]
            }
        ).then(function (res) {
            switch (res.updateList) {
                case "Role":
                    updateRole(ans);
                    break;
                case "Manager":
                    updateManager(ans);
                    break;
                case "First Name":
                    updateName(ans, "first");
                    break;
                case "Last Name":
                    updateName(ans, "last");
                    break;
                default:
                    updating();
                    break;
            }
        }).catch(function (err) {
            if (err) throw err;
        });
}

async function updateRole(ans) {
    const roleChoices = await indeterminateList('title', 'roles');
    roleChoices.push("New Role");
    roleChoices.push("Back");
    inquirer
        .prompt(
            {
                message: `What is ${ans}'s new role?`,
                type: "list",
                name: "updateList",
                choices: roleChoices
            }
        ).then(function (res) {

            if (res.roleChoices === "Back") updateHow();
            else if (res.roleChoices === "New Role") backToStart();
            else {
                connection.query(`SELECT * FROM roles WHERE title=?;`, [res.updateList], function (err, result) {
                    if (err) console.log(err);
                    const roleID = result[0].id;
                    connection.query(`UPDATE employees SET role_id= ?
                            WHERE concat(first_name, ' ', last_name)= ?;`, [roleID, ans], function (err, completed) {
                        console.log(completed.affectedRows + " record(s) updated");
                        nextTask();
                    })

                })
            }

        }).catch(function (err) {
            if (err) throw err;
        });

}

async function updateManager(ans) {
    const roleChoices = await indeterminateList(`concat(first_name, ' ', last_name)`, 'managers');
    roleChoices.push("New Manager")
    roleChoices.push("Back");
    inquirer
        .prompt(
            {
                message: `Who is ${ans}'s new manager?`,
                type: "list",
                name: "updateList",
                choices: roleChoices
            }
        ).then(function (res) {
            if (res.roleChoices === "Back") updateHow();
            else if (res.roleChoices === "New Manager") backToStart();
            else {
                connection.query(`SELECT * FROM managers WHERE concat(first_name, ' ', last_name)=?;`, [res.updateList], function (err, result) {
                    if (err) console.log(err);
                    const managerID = result[0].id;
                    connection.query(`UPDATE employees SET manager_id= ?
                    WHERE concat(first_name, ' ', last_name)= ?;`, [managerID, ans], function (err, completed) {
                        console.log(completed.affectedRows + " record(s) updated");
                        nextTask();
                    })

                })
            }

        }).catch(function (err) {
            if (err) throw err;
        });
}

async function updateName(ans, type) {
    inquirer
        .prompt(
            {
                message: `What is ${ans}'s new ${type} name?`,
                type: "input",
                name: "nameUpdate"
            }
        ).then(async function (res) {
            let cont = true;
            if (res.nameUpdate === "Back") updateHow();
            else if (!res.nameUpdate || res.nameUpdate === null) {
                const invalidCont = await inquirer.prompt(
                    {
                        type: "confirm",
                        message: "This is not a valid name. Continue anyway?",
                        name: "cont"
                    }
                )
                cont = invalidCont.cont;
                if (!cont) updateHow();
            } else if (cont) {

                connection.query(`SELECT * FROM employees WHERE concat(first_name, ' ', last_name)=?;`, [ans], function (err, result) {
                    if (err) console.log(err);
                    const id = result[0].id;

                    connection.query(`UPDATE employees SET ${type}_name = ?
                    WHERE id = ?;`, [res.nameUpdate, result[0].id], function (err, completed) {
                        console.log(completed.affectedRows + " record(s) updated");
                        nextTask();
                    })

                })
            }

        }).catch(function (err) {
            if (err) throw err;
        });

}

function indeterminateList(listEls, database) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT ${listEls} AS name FROM ${database};`, function (err, res) {
            if (err) reject(err);

            // console.log(`SELECT ${listEls} AS name FROM ${database};`)
            // console.log(res);

            let choicesArray = [];
            for (let i = 0; i < res.length; i++) {
                choicesArray.push(res[i].name);
            }

            resolve(choicesArray);
        })
    })
}

function validateExample() {
    // validate: function (input) {
    //     if (input === "") return "Error! put in a real name";
    // }
}