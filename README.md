# Comment System

This is a fullstack application that implements a comment system similar to YouTube or Reddit. The application consists of a Django backend with SQLite database and a React + Remix frontend.

## Project Structure

```
comment_system/
├── backend/     # Django + SQLite backend
└── frontend/    # React + Remix frontend
```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
   or 
   ```bash
   python -m venv venv
   ```
   on MacOS

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Apply migrations:
   ```bash
   python manage.py migrate
   ```

6. Load initial comment data, putting your comments into the /fixtures folder or specifying a custom path via --file:
   ```bash
   python manage.py import_comments --file=comments.json
   ```

7. Run the development server:
   ```bash
   python manage.py runserver
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Access the application in your browser at: `http://localhost:3000`

## API Endpoints

- `GET /api/comments/` - List all comments
- `POST /api/comments/` - Create a new comment (or a reply)
- `GET /api/comments/:id/` - Retrieve a specific comment
- `PUT /api/comments/:id/` - Update a specific comment
- `DELETE /api/comments/:id/` - Delete a specific comment 
- `DELETE /api/comments/wipe` - Delete All Comments

## Considerations

* The project was built with Cursor + Claude 3.7 with some manual changes and Agent adjustments since the document didn't prohibit us from using AI assistance
* No tests on FE/BE
* The images were treated as avatar icons instead of the attached images
* Added replies, since Reddit has these

## Limitations

* Deleting a parent comment deletes the whole thread, unlike Reddit
* As per requirements, posts can't be liked by an admin