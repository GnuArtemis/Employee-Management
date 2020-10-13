DROP DATABASE IF EXISTS employment_DB;
CREATE DATABASE employment_DB;

USE employment_DB;

CREATE TABLE employees (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    
    PRIMARY KEY(id),
    FOREIGN KEY(role_id) REFERENCES roles(id)

);

CREATE TABLE roles (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL(10,2),
    department_id INT,

    PRIMARY KEY(id),
    FOREIGN KEY(department_id) REFERENCES department(id)
);

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30),

    PRIMARY KEY (id)
);