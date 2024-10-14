Exelaki Frontend
================

Overview
--------

This is the frontend codebase for the Exelaki budgeting application. It provides a user-friendly interface for users to manage their budgets, add income and expenses, and monitor their financial progress. The frontend is developed using React and TypeScript, with additional tools for state management and API interactions.

Prerequisites
-------------

To run the project, ensure you have the following installed:

-   Node.js (v16.x or higher)

-   npm or Yarn as the package manager

Installation
------------

### Clone the repository:

```
git clone <repository-url>
cd exelaki-frontend
```

### Install the dependencies:

```
npm install
# or
yarn install
```

Running the Development Server
------------------------------

To start the development server, run the following command:

### `npm start`

or

### `yarn start`

The application should be available at `http://localhost:3000`.

Project Structure
-----------------

-   `**src/components**`: Contains reusable UI components, including forms for adding entries, tables, headers, etc.

-   `**src/pages**`: Includes page components, such as the login, signup, dashboard, and welcome pages.

-   `**src/contexts**`: Context API files for managing authentication (`AuthContext`) and budget data (`BudgetContext`).

-   `**src/hooks**`: Custom hooks that encapsulate reusable logic.

-   `**src/services**`: Functions to interact with the backend API (`authService`, `dashBoardService`).

-   `**src/types**`: TypeScript type definitions for type safety across the application.

-   `**src/utils**`: Utility functions for validation and token management.

-   `**src/styles**`: Application stylesheets.

Authentication Flow
-------------------

The app implements an authentication mechanism using access tokens.

-   Users login or signup to obtain an access token, which is stored in `localStorage`.

-   `**AuthContext**` manages the authentication state (`isAuthenticated`) and provides login/logout methods to components.

-   Tokens are used for secure communication with the backend API.

Available Scripts
-----------------

### `npm start`

Runs the app in the development mode.

### `npm run build`

Builds the app for production.

### `npm test`

Launches the test runner.

Environment Variables
---------------------

Create a `.env` file in the root directory and configure the following environment variables:

```
REACT_APP_API_URL=http://localhost:5000/api
```

This environment variable is used to point the frontend to the backend API.

Dependencies
------------

-   **React**: A JavaScript library for building user interfaces.

-   **React Router**: Used for handling routing/navigation within the app.

-   **Axios**: For making API requests.

-   **Tailwind CSS**: A utility-first CSS framework for styling.

Important Files
---------------

-   `**src/index.tsx**`: The entry point for the React application.

-   `**src/App.tsx**`: Contains the main routing logic for the application.

-   `**src/contexts/AuthContext.tsx**`: Manages user authentication state and provides utility functions for login and logout.

Future Enhancements
-------------------

-   **Improved Error Handling**: Adding comprehensive error messages to guide users.

-   **Token Refresh Flow**: Implement an automatic refresh of access tokens when they expire.

-   **Profile Management**: Allow users to update their profile information.

Contributing
------------

Contributions are welcome. To contribute:

1.  Fork the repository.

2.  Create a feature branch (`git checkout -b feature-name`).

3.  Commit your changes (`git commit -m 'Add some feature'`).

4.  Push to the branch (`git push origin feature-name`).

5.  Open a pull request.

License
-------

This project is licensed under the MIT License.