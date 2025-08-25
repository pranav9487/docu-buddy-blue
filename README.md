
Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

# DocuBuddy - AI-Powered Documentation Assistant

DocuBuddy is an intelligent documentation assistant that helps teams access and understand their company's knowledge base efficiently using natural language processing.

## 🌟 Features

- **AI-Powered Search**: Natural language understanding for document queries
- **Smart Responses**: Get contextual answers from your documentation
- **User Authentication**: Secure access with Supabase authentication
- **Real-time Chat**: Interactive chat interface for document queries
- **Admin Dashboard**: Manage users and monitor usage
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: Tailwind CSS + shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **API Integration**: n8n webhook
- **Deployment**: Render

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- n8n webhook URL

## 💻 Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/docu-buddy.git
cd docu-buddy
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory
```env
VITE_API_URL=your_n8n_webhook_url
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

## 🛠️ Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL scripts in the `supabase` folder:
   - `setup.sql`
   - `storage-setup.sql`
   - Other configuration scripts as needed

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_API_URL=your_n8n_webhook_url
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Deployment

### Deploying to Render

1. Connect your GitHub repository to Render
2. Configure the build settings:
   - Build Command: `npm run build`
   - Start Command: `npm run start`
   - Publish Directory: `dist`
3. Add environment variables in Render dashboard

## 📖 Usage

1. Sign up for a new account or log in
2. Access the chat interface to ask questions about your documentation
3. Get instant, contextual responses from the AI
4. Admins can access the dashboard to manage users and monitor usage

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - *Initial work* - [YourGithub](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for authentication and database
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [n8n](https://n8n.io/) for workflow automation
