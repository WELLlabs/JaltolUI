# Jaltol UI

## Overview
This is a React application designed to [briefly describe the purpose of your app]. This guide will help you set up the project on your local machine.

## Prerequisites
- **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: Ensure you have npm installed. It usually comes with Node.js. You can check your npm version by running:
  ```sh
  npm --version
  
## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


## Installation Instructions

### 1. Clone the Repository
First, clone the repository to your local machine using the following command:

     ```sh
     git clone https://github.com/your-username/your-repo-name.git
     cd JaltolUI
     ```

2. Install the Required Dependencies
Install the dependencies listed in the package.json file:
  ```sh
  npm install
  ```


3. Run the Development Server
Start the development server:

     ```sh 
    npm run dev
     ```

# Important 

To connect the frontend with locally run backend please go to the codefile src/ services/ api.jsx, and comment out the line number 3 and uncomment the line number 4

it should looks like this 
```sh
    #const API_URL = 'https://app.jaltol.app/api'; // Your Django app URL
    const API_URL = 'http://127.0.0.1:8000/api'; 
```
    
