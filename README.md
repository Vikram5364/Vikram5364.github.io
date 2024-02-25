# FitRevolt README

Welcome to our FitRevolt! This Node.js application helps you track your fitness progress and manage your workouts effectively.

## Pre-requisites

Before getting started, ensure you have the following pre-requisites installed on your system:

1. **MySQL**: You need to have MySQL installed on your machine to store and manage the application's data.
    - You can download MySQL from [here](https://dev.mysql.com/downloads/).

2. **Node.js and NPM**: Node.js is required to run the application, and NPM (Node Package Manager) is used to manage dependencies.
    - You can download Node.js and NPM from [here](https://nodejs.org/).

3. **Clone the App**: Clone the repository of our FitRevolt to your local machine using the following command:
```bash
git clone https://github.com/your_username/fitness-app.git
```

## Setup Instructions

Follow these steps to set up and run the FitRevolt on your system:

1. **Database Configuration**:
- **MySQL Installation**: Ensure you have MySQL installed on your machine. You can download MySQL from [here](https://dev.mysql.com/downloads/).
- **Create Database**: Once MySQL is installed, create a new database called `fitrevolt`. You can do this using MySQL command-line interface or a GUI tool like MySQL Workbench.

2. **Install Dependencies**:
   Navigate to the root directory of the application in your terminal and run the following command to install the required dependencies:
```bash
npm install
```

3. **Generate Environment Variables**:
   After installing dependencies, run the following command to generate environment variables required for the application:
```bash
node generate-env-vars.js
```

4. **Configure Database Connection**:
   Instead of configuring the database in `config.js`, you need to update the database connection details in `utils/db.js` file located in the root directory of the application:
```javascript
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'your_database_username',
    password: 'your_database_password',
    database: 'fitrevolt'
});

module.exports = connection;
```

5. **Generate SQL Tables**:
   Once environment variables are generated, run the following command to generate SQL tables for the application:
```bash
node generate-sql-tables.js
```

6. **Run the Application**:
   After configuring the database connection, start the application using the following command:
```bash
npm start 
```
The application will be running at http://localhost:7777.

### Usage

You can access the FitRevolt through your web browser at http://localhost:7777. Explore the various features provided by the application to track your fitness progress, manage workouts, set goals, and more.

### Contribution

We welcome contributions from developers to improve our FitRevolt. If you have any suggestions, bug fixes, or new features to propose, please feel free to open an issue or submit a pull request on our GitHub repository.

### License

FitRevolt is licensed under the MIT License. See the LICENSE file for details.













