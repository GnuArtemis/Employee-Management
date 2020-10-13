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
connection.connect(function(err) {
    if (err) throw err;

    console.log("Welcome to the employee management system!");
    nextTask();
})

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
                    console.log("Now viewing...");
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
        }).catch(function(err){
            if (err) throw err;
        })
}

function backToStart () {
    console.log("This command is currently in beta. Please choose something else for now.");
    nextTask();
}

function adding () {
    inquirer
        .prompt(
            {
                message: "What would you like to add?",
                type: "list",
                name: "next",
                choices: ["Department", "Role", "Employee", "Back"]
            }
        ).then(function (res) {
            switch (res.next) {
                case "Department":
                    console.log("Now adding department...");
                    backToStart();
                    break;
                case "Role":
                    console.log("Now adding role...");
                    backToStart();
                    break;
                case "Employee":
                    console.log("Now adding employee...");
                    backToStart();
                    break;

                default:
                    nextTask();
                    break;
            }
        }).catch(function(err){
            if (err) throw err;
        })
}

function viewing () {
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
                    console.log("Now viewing all departments...");
                    backToStart();
                    break;
                case "Roles":
                    console.log("Now viewing all roles...");
                    backToStart();
                    break;
                case "Employees":
                    console.log("Now viewing all employees...");
                    backToStart();
                    break;

                default:
                    nextTask();
                    break;
            }
        }).catch(function(err){
            if (err) throw err;
        })
}

function updating () {
    inquirer
        .prompt(
            {
                message: "Which employee would you like to update?",
                type: "input",
                name: "employeeUpdate"
            }
        ).then(function (res) {
            if(res.employeeUpdate) console.log("Now updating your employee...");
            backToStart();
        }).catch(function(err){
            if (err) throw err;
        })
}