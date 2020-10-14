//Requires npm libraries
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

//Creates mysql connection
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
                    adding();
                    break;
                case "View":
                    viewing();
                    break;
                case "Update":
                    updating();
                    break;
                case "Delete":
                    // updating();
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
                    departmentAdd(false, false);
                    break;
                case "Roles":
                    console.log("Now adding roles...");
                    roleAdd(false);
                    break;
                case "Employees":
                    console.log("Now adding employees...");
                    employeeAdd(false);
                    break;

                default:
                    nextTask();
                    break;
            }
        }).catch(function (err) {
            if (err) throw err;
        })
}

function departmentAdd(fromRole, fromUpdate) {
    inquirer
        .prompt(
            {
                message: "What is the name of your new department?",
                type: "input",
                name: "deptName"
            }
        ).then(function (res) {
            if (!res.deptName) {
                console.log("Your inputs were not valid. Please try again.")
                if (fromUpdate) console.log("Aborting employee update. Please continue creating a new department.");
                adding();
            } else {
                connection.query(`INSERT INTO departments(name) VALUES (?)`, [res.deptName], function (err, completed) {
                    if (err) console.log(err);
                    console.log(completed.affectedRows + " department created!")
                    if (fromRole) roleAdd(fromUpdate);
                    else nextTask();
                })
            }
        })
}

async function roleAdd(fromUpdate) {
    const deptChoices = await indeterminateList("name", "departments");
    deptChoices[0].push("New Department")
    inquirer
        .prompt([
            {
                message: "What department does your new role belong to?",
                type: "list",
                name: "dept",
                choices: deptChoices[0]
            },
            {
                message: "What is the title of your new role?",
                type: "input",
                name: "roleTitle",
                when: (answers) => answers.dept !== "New Department"
            },
            {
                message: "What is the salary estimate of your new role?",
                type: "number",
                name: "salary",
                when: (answers) => answers.dept !== "New Department"
            }
        ]).then(function (res) {
            if (res.dept === "New Department") {
                departmentAdd(true, fromUpdate)
            } else if (!res.roleTitle || !res.salary || !res.dept) {
                console.log("Your inputs were not valid. Please try again.")
                if (fromUpdate) console.log("Aborting employee update. Please continue creating a new role.");
                adding();
            } else {

                const index = deptChoices[0].findIndex(element => element === res.dept);
                const id = deptChoices[1][index];
                connection.query(`INSERT INTO roles(title,salary,department_id) VALUES (?,?,?)`, [res.roleTitle, res.salary, id], function (err, completed) {
                    if (err) console.log(err);
                    console.log(completed.affectedRows + " role created!")

                    if (fromUpdate[2]==="roleUpdate") updateRole(fromUpdate[0], fromUpdate[1]);
                    else if (fromUpdate[2] === "employeeAdd") employeeAdd();
                    else nextTask();
                })
            }
        })
}

async function employeeAdd() {
    const roleChoices = await indeterminateList("title", "roles");
    roleChoices[0].push("New Role")
    const managerChoices = await indeterminateList(`concat(managers.first_name, ' ', 
    managers.last_name)`, "managers")
    managerChoices[0].push("Not Applicable");

    inquirer
        .prompt([
            {
                message: "What job title does your new employee have?",
                type: "list",
                name: "jobTitle",
                choices: roleChoices[0]
            },
            {
                message: "What is the first name of your new employee?",
                type: "input",
                name: "fName",
                when: answers => answers.jobTitle !== "New Role"
            },
            {
                message: "What is the last name of your new employee?",
                type: "input",
                name: "lName",
                when: answers => answers.jobTitle !== "New Role"
            },
            {
                message: "Who is the manager of your new employee?",
                type: "list",
                name: "manager",
                choices: managerChoices[0],
                when: answers => answers.jobTitle !== "New Role"
            }
        ]).then(function (res) {

            if (res.jobTitle === "New Role"){
                roleAdd(["","","employeeAdd"]);
            }else if (!res.fName || !res.lName || !res.jobTitle || !res.manager) {
                console.log("Your inputs were not valid. Please try again.")
                adding();
            } else {

                const roleIndex = roleChoices[0].findIndex(element => element === res.jobTitle);
                const roleId = roleChoices[1][roleIndex];
                const managerIndex = managerChoices[0].findIndex(element => element === res.manager);
                const managerID = managerChoices[1][managerIndex]

                connection.query(`INSERT INTO employees (first_name, last_name,role_id,manager_id) VALUES (?,?,?,?)`, [res.fName, res.lName, roleId, managerID], function (err, completed) {
                    if (err) console.log(err);
                    console.log(completed.affectedRows + " role created!")
                    nextTask();
                })
            }
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
                        if(!result.length) console.log("No results under these search parameters.");
                        console.table(result);
                        nextTask();
                    })

                    break;
                case "Roles":
                    console.log("Now viewing all roles:");
                    connection.query(`SELECT title AS "Job Title",salary AS "Salary (USD)" FROM roles`, function (err, result) {
                        if(!result.length) console.log("No results under these search parameters.");
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
                choices: ["Department", "Role", "Manager", "All", "Back"]
            }).then(async function (response) {
                let sortList;
                switch (response.viewOptions) {
                    case "All":
                        console.table(await niceEmployeeDisplay());
                        nextTask();
                        break;
                    case "Department":
                        sortList = await indeterminateList("name", "departments");
                        sortList[0].push("Back");
                        inquirer.prompt({
                            type: "list",
                            message: "Please choose a department by which you want to view employees.",
                            choices: sortList[0],
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
                        sortList[0].push("Back");
                        inquirer.prompt({
                            type: "list",
                            message: "Please choose a role by which you want to view employees.",
                            choices: sortList[0],
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
                        sortList[0].push("Back");
                        inquirer.prompt({
                            type: "list",
                            message: "Please choose a manager by which you want to view employees.",
                            choices: sortList[0],
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
    employeeList[0].push("Back")
    inquirer
        .prompt(
            {
                message: "Which employee would you like to update?",
                type: "list",
                name: "employeeUpdate",
                choices: employeeList[0]
            }
        ).then(function (res) {

            if (res.employeeUpdate === "Back") nextTask();
            else {
                const index = employeeList[0].findIndex(element => element === res.employeeUpdate)
                const id = employeeList[1][index]
                console.log(`Now updating ${res.employeeUpdate}`);
                updateHow(res.employeeUpdate, id);
            }

        }).catch(function (err) {
            if (err) throw err;
        });



}

function updateHow(ans, id) {
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
                    updateRole(ans, id);
                    break;
                case "Manager":
                    inquirer
                        .prompt([
                            {
                                type: "list",
                                message: `Are you promoting ${ans} to manager status, or changing who is the manager of ${ans}?`,
                                name: "manageManager",
                                choices: ["Promoting", "Changing"]
                            }
                        ]).then(function (response) {
                            if (response.manageManager === "Promoting") {
                                promoteManager(ans, id, null)
                            } else {
                                updateManager(ans, id);
                            }

                        })
                    break;

                case "First Name":
                    updateName(ans, "first", id);
                    break;
                case "Last Name":
                    updateName(ans, "last", id);
                    break;
                default:
                    updating();
                    break;
            }
        }).catch(function (err) {
            if (err) throw err;
        });
}

async function updateRole(ans, ansid) {
    const roleChoices = await indeterminateList('title', 'roles');
    roleChoices[0].push("New Role");
    roleChoices[0].push("Back");
    inquirer
        .prompt(
            {
                message: `What is ${ans}'s new role?`,
                type: "list",
                name: "updateList",
                choices: roleChoices[0]
            }
        ).then(function (res) {

            if (res.updateList === "Back") updateHow(ans, ansid);
            else if (res.updateList === "New Role") roleAdd([ans, ansId,"roleUpdate"]);
            else {
                const index = roleChoices[0].findIndex(element => element === res.updateList);
                const id = roleChoices[1][index];

                connection.query(`UPDATE employees SET role_id= ?
                        WHERE id = ?;`, [id, ansid], function (err, completed) {
                    console.log(completed.affectedRows + " record(s) updated");
                    nextTask();
                })
            }

        }).catch(function (err) {
            if (err) throw err;
        });

}

function promoteManager(ans, ansId, fromUpdate) {
    connection.query(`SELECT * FROM employees WHERE id = ?`, [ansId], function (err, completed) {
        if (err) console.log(err);
        connection.query(`INSERT INTO managers(first_name, last_name, employee_id) VALUES (?,?,?)`, [completed[0].first_name, completed[0].last_name, ansId], function (err, comp) {
            if (err) console.log(err);
            console.log(comp.affectedRows + " record(s) updated");
            if(fromUpdate !== null) updateManager(fromUpdate[0],fromUpdate[1]);
            else nextTask();
        })

    })

}

async function updateManager(ans, ansid) {
    const roleChoices = await indeterminateList(`concat(managers.first_name, ' ', 
    managers.last_name)`, "managers");
    roleChoices[0].push("New Manager")
    roleChoices[0].push("Back");
    inquirer
        .prompt(
            {
                message: `Who is ${ans}'s new manager?`,
                type: "list",
                name: "updateList",
                choices: roleChoices[0]
            }
        ).then(async function (res) {
            if (res.updateList === "Back") updateHow(ans, ansid);
            else if (res.updateList === "New Manager"){
                const employeeList = await indeterminateList(`concat(employees.first_name, ' ', employees.last_name)`, `employees LEFT JOIN managers ON employees.id = managers.employee_id WHERE managers.id IS NULL`, `employees.`);
                employeeList[0].push("Back");
                inquirer
                    .prompt([
                        {
                            message: `Please choose who to promote to manager.`,
                            type: "list",
                            choices: employeeList[0],
                            name: "promotion"
                        }
                    ]).then(function(answer) {
                        if(answer.promotion === "Back") updateManager(ans, ansid);
                        else {
                            const index = employeeList[0].findIndex(element => element === answer.promotion)
                            const id = employeeList[1][index];

                            promoteManager(answer.promotion,id,[ans,ansid]);
                        }
                    })
            }
            else {
                const index = roleChoices[0].findIndex(element => element === res.updateList);
                const id = roleChoices[1][index];

                connection.query(`UPDATE employees SET manager_id= ?
                WHERE id= ?;`, [id, ansid], function (err, completed) {
                    if (err) console.log(err);
                    console.log(completed.affectedRows + " record(s) updated");
                    nextTask();
                })

            }

        }).catch(function (err) {
            if (err) throw err;
        });
}

async function updateName(ans, type, ansid) {
    inquirer
        .prompt(
            {
                message: `What is ${ans}'s new ${type} name?`,
                type: "input",
                name: "nameUpdate"
            }
        ).then(async function (res) {
            let cont = true;
            if (res.nameUpdate === "Back") updateHow(ansid);
            else if (!res.nameUpdate || res.nameUpdate === null) {
                const invalidCont = await inquirer.prompt(
                    {
                        type: "confirm",
                        message: "This is not a valid name. Continue anyway?",
                        name: "cont"
                    }
                )
                cont = invalidCont.cont;
                if (!cont) updateName(ans, type, ansid);
            }
            if (cont) {

                connection.query(`UPDATE employees SET ${type}_name = ?
                WHERE id = ?;`, [res.nameUpdate, ansid], function (err, completed) {
                    console.log(completed.affectedRows + " record(s) updated");
                    nextTask();
                })

            }

        }).catch(function (err) {
            if (err) throw err;
        });

}

function indeterminateList(listEls, database, clarification) {
    return new Promise((resolve, reject) => {
        if(!clarification) clarification = "";
        connection.query(`SELECT ${listEls} AS name, ${clarification}id FROM ${database};`, function (err, res) {
            if (err) reject(err);

            // console.log(`SELECT ${listEls} AS name FROM ${database};`)
            // console.log(res);

            let choicesArray = [];
            let idArray = [];

            let max;
            if(res) max = res.length;
            else max = 0;

            for (let i = 0; i < max; i++) {
                choicesArray.push(res[i].name);
                idArray.push(res[i].id);
            }

            resolve([choicesArray, idArray]);
        })
    })
}

function validateExample() {
    // validate: function (input) {
    //     if (input === "") return "Error! put in a real name";
    // }
}