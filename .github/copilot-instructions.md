# Activio — Project Specification

Build a full-stack web application called **Activio**.

The goal is to help people find other people nearby who want to participate in the same activities, initially focusing on sports.

The application should allow users to:

1. Create an account and profile.
2. Specify sports/activities they are interested in.
3. Specify their skill level for each activity.
4. Specify when they are generally available.
5. Specify their approximate location.
6. Describe what they are looking for using natural language.
7. Use AI to convert their natural-language description into structured preferences.
8. Find compatible people and activities.
9. View a compatibility score and an explanation of why someone is a good match.
10. Eventually message/connect with matched users.

## Technology

### Backend

* Python
* FastAPI
* PostgreSQL
* SQLAlchemy
* Alembic
* Pydantic
* JWT authentication
* pytest

### Frontend

* Next.js
* TypeScript
* React
* Tailwind CSS

### AI

Use an LLM API for natural-language preference extraction.

AI should NOT directly determine the final match.

The AI should convert free-form text into structured data which is then processed by deterministic matching logic.

## Core concept

A user profile should contain structured information such as:

* activities
* skill levels
* preferred activity intensity
* availability
* approximate location
* preferred distance
* age preference if the user chooses to provide one
* preferred group size
* social preferences

Example natural-language input:

"I'm an intermediate tennis player. I usually play after 6pm on weekdays and would like to find someone around my level who wants fairly competitive games. I'd prefer someone within about 10km."

The AI should extract structured information such as:

{
"activities": ["tennis"],
"skill_level": "intermediate",
"availability": {
"days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
"start_time": "18:00"
},
"intensity": "competitive",
"max_distance_km": 10
}

The exact schema should be validated using Pydantic.

## Matching system

Implement a deterministic compatibility scoring system.

Initially use:

* Activity compatibility: 30%
* Skill compatibility: 20%
* Availability overlap: 20%
* Location proximity: 15%
* Intensity/social preference compatibility: 15%

The final score should be between 0 and 100.

The matching algorithm should be implemented as a separate service rather than inside API routes.

For every match, return an explanation such as:

"92% match because you both play intermediate tennis, are available Wednesday evening, and live within 4km of each other."

The algorithm should be easy to modify later.

## Backend architecture

Use a layered architecture:

API routes
→ services
→ database models

Do not put business logic directly into route handlers.

Separate:

* API routes
* Pydantic schemas
* SQLAlchemy models
* authentication/security
* business logic
* AI integration
* matching logic
* database configuration

Use dependency injection for database sessions and authenticated users.

## Database

Create relational PostgreSQL models for at least:

* User
* UserProfile
* Activity
* UserActivity
* Availability
* Match

Use proper foreign keys and relationships.

Use Alembic for migrations.

Do not rely on automatically creating database tables when the application starts.

## Authentication

Implement:

* registration
* login
* password hashing
* JWT access tokens
* authenticated API endpoints
* current-user dependency

Never store plaintext passwords.

Never hardcode secrets.

Use environment variables.

Provide a `.env.example`.

## API

Create REST endpoints approximately like:

POST /api/auth/register
POST /api/auth/login
GET /api/users/me
PUT /api/users/me

GET /api/activities
POST /api/users/me/activities
DELETE /api/users/me/activities/{activity_id}

GET /api/users/me/availability
PUT /api/users/me/availability

POST /api/ai/parse-profile

GET /api/matches
GET /api/matches/{match_id}

Use appropriate HTTP status codes and Pydantic request/response models.

## Frontend

Create a clean, modern interface.

Pages should include:

* Landing page
* Register
* Login
* Profile setup
* Dashboard
* Find Matches
* Match Details
* Settings

The profile setup should allow both:

1. Manually entering structured information.
2. Describing yourself naturally and allowing AI to extract the information.

Example:

"Tell us about yourself"

"I'm a beginner runner and usually run 5km after work on Tuesdays and Thursdays..."

Then show the extracted information to the user for confirmation before saving it.

The user must always be able to edit AI-generated information.

## Important design principles

* Keep AI functionality isolated from core business logic.
* Do not expose API keys to the frontend.
* Validate all user input.
* Use typed schemas.
* Use database migrations.
* Write tests for the matching algorithm.
* Keep route handlers thin.
* Use service classes/functions for business logic.
* Write useful error messages.
* Do not generate placeholder implementations when a real implementation is straightforward.
* Do not add unnecessary dependencies.
* Do not over-engineer the MVP.

## Development approach

Build this incrementally.

Do NOT implement the entire application in one step.

Start with:

1. Repository structure.
2. FastAPI application.
3. PostgreSQL connection.
4. SQLAlchemy models.
5. Alembic migrations.
6. Authentication.
7. User profiles.
8. Activities.
9. Availability.
10. Matching algorithm.
11. Match API.
12. Frontend authentication.
13. Profile UI.
14. Match UI.
15. AI natural-language profile parsing.
16. Tests.
17. Docker/deployment configuration.

After completing each stage, explain:

* what was implemented
* which files changed
* how to run it
* how to test it
* any design decisions

Do not proceed to a completely unrelated stage until the current stage is working.
