# Bundeswahlleiter Election Analysis System

## Dokumentation

Die Lastenheft, Pflichtenheft, Sitzverteilung erklaerung und Ablauf bei der Stimmabgabe findet ihr unter der [Wiki](../../wikis/home)!

## Project Overview

The **Bundeswahlleiter Election Analysis System** is a backend and frontend system designed to process and analyze election data from the German Bundestag elections. It provides endpoints to query election results, voter turnout, and socio-political correlations.

### Key Features:
- REST API for election analysis
- Secure JWT-based authentication
- Aggregation of voting data
- Statistical analysis of voting trends
- PDF generation of election reports
- Live election monitoring

## Architecture

### Backend
- **Framework**: Spring Boot (Java)
- **Database**: PostgreSQL
- **Security**: JWT authentication, role-based access control
- **API Layer**: Spring MVC controllers exposing RESTful endpoints
- **Services**: Election analysis, voting logic, and socio-political statistics
- **Persistence Layer**: JPA repositories for data access

### Frontend
- **Framework**: Next.js (React with TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **Routing**: Next.js dynamic routing
- **API Integration**: Fetching election results from the backend

### Data Flow
1. Election data is retrieved from the database via JPA.
2. Data is processed using business logic services.
3. Processed data is exposed via RESTful endpoints.
4. Frontend consumes API endpoints for visualization.
5. Authentication is handled via JWT-based security.

## Endpoints and Usage

### OpenAPI Specification Documentation

#### Voting Endpoints

- **POST /validate-hash-and-issue-token/{code}**: Validates the hash and issues a voting token.
- **POST /secure/submit/vote**: Submits a vote securely.
- **GET /secure/vote/zweitstimme**: Retrieves the second vote options for a constituency.
- **GET /secure/vote/erstestimme**: Retrieves the first vote options for a constituency.
- **GET /secure/validate-token**: Validates the voting token.

#### PDF Endpoints

- **GET /download/pdf**: Downloads a PDF file.

#### Analysen Endpoints

- **GET /ergebnisse/wahlkreise**: Retrieves a list of all constituencies.
- **GET /ergebnisse/wahlkreisSieger/{year}**: Retrieves the winners of each constituency for a specific year.
- **GET /ergebnisse/wahlkreis/uebersicht/{year}/{wahlkreis_id}/{useAggregation}**: Provides an overview of a specific constituency.
- **GET /ergebnisse/ueberhangmandate/{year}/{grouping}**: Retrieves overhang mandates for a specific year and grouping.
- **GET /ergebnisse/socioCulturalStats/{year}/{type}**: Retrieves socio-cultural statistics for a specific year and type.
- **GET /ergebnisse/sitzverteilung/{year}**: Retrieves the distribution of seats in the Bundestag for a specific year.
- **GET /ergebnisse/nonVoters/{year}/{erststimme}**: Retrieves non-voters data for a specific year and vote type.
- **GET /ergebnisse/knappsteSieger/{year}**: Retrieves the closest winners for a specific year.
- **GET /ergebnisse/jahre**: Retrieves all years for which election data is available.
- **GET /ergebnisse/election/status**: Retrieves the current status of the election.
- **GET /ergebnisse/bundestagsmitglieder/{year}/{bundesland_id}**: Retrieves members of the Bundestag for a specific year and federal state.
- **GET /ergebnisse/bundeslander**: Retrieves a list of all federal states.
- **GET /ergebnisse/analysis/live**: Retrieves live analysis of the election.

### Website Pages and Usage
- `/` - Home page showing an overview of elections
- `/analysis` - Analysis section with different election trends
- `/analysis/closest-winners` - Lists the closest election victories
- `/analysis/constituency-details/{id}` - Shows details for a specific constituency
- `/analysis/seat-distribution` - Displays seat distribution analysis
- `/analysis/socio-correlation` - Displays socio-economic correlation of votes
- `/vote` - Voting section for submitting votes
- `/vote/live-results` - Displays live results of elections
- `/admin/dashboard` - Admin panel to manage elections

#### Voting System
- `POST /vote/submit` - Submit a vote
- `GET /vote/status` - Get current voting status
- `GET /vote/results/{year}` - Get election results for a specific year

#### Admin Features
- `POST /admin/elections/start` - Start a new election
- `POST /admin/elections/close` - Close an ongoing election
- `POST /admin/users/create` - Create a new user (admin only)
- `DELETE /admin/users/{id}` - Delete a user (admin only)

## Setup and Installation

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL
- Docker & Docker Compose (for containerized setup)

### Backend Build & Run
```bash
cd backend-datenbanken
docker compose up -d
```
Backend url is: url http://localhost:80/

### Frontend Build & Setup
```bash
cd frontend-new
npm install
npm run dev
```
Frontend url is http://localhost:3030/
You have to set in the .env file the following property: NEXT_PUBLIC_API_URL=http://localhost:80
