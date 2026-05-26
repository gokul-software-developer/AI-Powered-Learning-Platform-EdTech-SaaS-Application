```markdown
# Bot Creation and Study Material Management Application

This project is a React-based application for creating and managing bots, with a feature to upload and manage study materials. It leverages modern frameworks and libraries for a seamless, scalable, and efficient user experience.

## Features

- **Bot Creation**: Create custom bots with a name and description.
- **File Management**: Upload, view, delete, and manage multiple study materials with size validation.
- **Responsive UI**: Sleek and responsive design built with ShadCN UI and Tailwind CSS.
- **Animation**: Smooth animations powered by Framer Motion.
- **State Management**: Efficient state handling using Redux and Redux Persist.
- **Data Fetching**: Optimized API interactions using React Query.
- **Backend Integration**: Uses Appwrite for backend services and data storage.

## Tech Stack

- **Frontend**: [Vite](https://vitejs.dev/) with React
- **State Management**: [Redux](https://redux.js.org/) and [Redux Persist](https://github.com/rt2zz/redux-persist)
- **API and Data Fetching**: [React Query](https://tanstack.com/query/latest)
- **UI Components**: [ShadCN UI](https://ui.shadcn.dev/) and [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Backend**: [Appwrite](https://appwrite.io/)

## Installation

Follow these steps to set up and run the application locally:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the necessary environment variables for Appwrite:
   ```env
   VITE_APPWRITE_ENDPOINT=<your-appwrite-endpoint>
   VITE_APPWRITE_PROJECT_ID=<your-appwrite-project-id>
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## Usage

### 1. Bot Creation
- Enter a bot name and optional description in the form.
- Upload one or multiple study material files.
- View the uploaded files below the form.
- Add or delete files as needed before submitting.

### 2. File Management
- The file section displays the list of uploaded study materials.
- Each file has options to delete or replace it.

### 3. Submission
- Click on the "Create Bot" button to submit the form.
- Ensure that all fields meet the validation criteria.

## Folder Structure

```plaintext
src/
├── components/      # Reusable UI components
├── features/        # Redux slices and state management logic
├── hooks/           # Custom React hooks
├── services/        # API calls and integrations (React Query/Appwrite)
├── pages/           # Page components for routing
├── styles/          # Tailwind CSS styles and configurations
├── App.tsx          # Main application entry point
└── main.tsx         # Vite entry point
```

## Key Libraries and Their Usage

- **Vite**: For a fast and optimized development experience.
- **Appwrite**: Handles backend services like authentication, database, and storage.
- **React Query**: Manages API calls and caching for a seamless user experience.
- **Redux & Redux Persist**: State management with persistent storage.
- **ShadCN UI & Tailwind CSS**: For building a beautiful and responsive interface.
- **Framer Motion**: Adds smooth animations and transitions.

## Contribution

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`feature/your-feature-name`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- [Appwrite](https://appwrite.io/) for backend services.
- [ShadCN UI](https://ui.shadcn.dev/) for design inspiration.
- [Vite](https://vitejs.dev/) for fast build tooling.
- [Framer Motion](https://www.framer.com/motion/) for animations.

---