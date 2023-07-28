# Personal Budget API (extended)
This is an extended version of a Personal Budget API that allows users to create and manage a personal budget using the envelope budgeting principles. As in previous version, users can create budget envelopes, track envelope balances, transfer budgets between envelopes. 
Now, they are also able to add, track and delete the transactions (ensuring that the budget remains accurate and consistent). Data is also persistent by attaching the API to the database.

## Table of Contents

- [Introduction](#personal-budget-api-(extended))
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)
- [License](#license)

## Features

- Create, read, update, and delete budget envelopes.
- Transfer budgets between envelopes.
- Record transactions with details such as amount and description.
- View all transactions and retrieve specific transaction.
- Automatic update of envelope balances based on transactions.
- Error handling for invalid requests and data consistency.

## Prerequisites

- PostgreSQL database

## Installation

1. Clone the repository:

git clone https://github.com/M-Dablju/personal-budget-extended-api.git

2. Install Node.js and npm (Node Package Manager) if you haven't already.
3. Navigate to the project directory in your terminal.
4. Install dependencies with the following command: npm install.
5. Set up the PostgreSQL database and update the db.js file with your database connection details.

## Usage
The application provides various endpoints to manage envelopes and transactions. You can use tools like Postman to interact with the API and test different functionalities.

1. Run the application.
The server will start, and the API will be accessible at http://localhost:3000.

2. Endpoints

- **Create Envelope:** POST `http://localhost:3000/envelopes`
- **Retrieve All Envelopes:** GET `http://localhost:3000/envelopes`
- **Retrieve Specific Envelope:** GET `http://localhost:3000/envelopes/:id`
- **Update Envelope and Balance:** PUT `http://localhost:3000/envelopes/:id`
- **Delete Envelope:** DELETE `http://localhost:3000/envelopes/:id`
- **Transfer Budgets Between Envelopes:** POST `http://localhost:3000/envelopes/transfer/:from/:to`
- **Add a new transaction:** POST `http://localhost:3000/transactions`
- **Retrieve all transactions:** GET `http://localhost:3000/transactions`
- **Retrieve specific transaction:** GET `http://localhost:3000/transactions/:id`
- **Delete specific transaction:** DELETE `http://localhost:3000/transactions/:id`

## Technologies
- Node.js
- Express.js
- PostgreSQL
- npm
- Postman (for testing)

## License

This project is licensed under the [MIT License](LICENSE).

Happy budgeting!
