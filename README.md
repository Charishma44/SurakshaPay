# SurakshaPay - Parametric Insurance for Gig Workers

A full-stack web application providing parametric insurance coverage for gig economy workers in India. The platform automatically triggers claims based on weather conditions and environmental factors.

## Features

### User Management
- User registration with profile creation (name, location, platform, weekly income)
- Secure authentication using Supabase Auth
- Profile management and tracking

### GPS Tracking
- Mock GPS location tracking
- Real-time coordinate updates
- Location-based risk assessment

### AI Risk Prediction
- ML-based risk scoring (0-100)
- Multi-factor risk assessment including:
  - Weather conditions (rainfall, temperature)
  - Air quality index (AQI)
  - Location risk factors
  - Income vulnerability
- Risk levels: Low, Medium, High
- Automatic updates every 30 seconds

### Dynamic Premium Calculation
- Weekly premium: ₹150
- Coverage amount: ₹50,000
- Automatic policy generation and renewal tracking

### Parametric Triggers
The system monitors three key environmental triggers:
- **Heavy Rainfall**: > 50mm
- **Extreme Heat**: > 42°C
- **Poor Air Quality**: AQI > 300

### Auto Claim Processing
- Automatic claim generation when triggers are activated
- Claim amount: 10% of coverage (₹5,000)
- Real-time claim status tracking
- Instant approval for parametric triggers

### Payment Simulation
- UPI mock payment interface
- Card payment simulation
- Secure payment flow demonstration

### Weather Simulation
- Automated weather data generation
- Location-specific conditions
- Updates every 20 seconds
- Real-time trigger monitoring

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React (icons)

### Backend
- Supabase (Database + Auth)
- PostgreSQL with Row Level Security
- Edge Functions (Deno runtime)

### Database Schema
- `user_profiles` - User information and GPS data
- `policies` - Insurance policy records
- `risk_assessments` - AI-generated risk scores
- `weather_events` - Environmental condition data
- `claims` - Automated claim records

## Edge Functions

### calculate-risk
Analyzes user profile and weather conditions to generate risk scores using a multi-factor algorithm.

### simulate-weather
Generates realistic weather data and automatically triggers claims when parametric thresholds are exceeded.

## How It Works

1. **Registration**: Users sign up with their personal and work details
2. **Policy Activation**: Upon login, users can activate their insurance policy
3. **Continuous Monitoring**: The system automatically:
   - Simulates weather conditions every 20 seconds
   - Calculates risk scores every 30 seconds
   - Tracks GPS location
   - Monitors parametric triggers
4. **Automatic Claims**: When conditions exceed thresholds, claims are instantly generated and approved
5. **Payment**: Users can simulate premium payments via UPI or card

## Security

- Row Level Security (RLS) enabled on all database tables
- Authenticated access required for all user data
- JWT-based authentication
- Secure API endpoints with CORS protection

## Dashboard Features

- Active policy overview with coverage details
- Real-time weather conditions display
- Risk assessment visualization
- GPS tracking status
- Claims history with detailed breakdown
- Payment simulator for premium processing

## Development

The application uses:
- Mobile-first responsive design
- Real-time data updates
- Optimistic UI patterns
- Automated background processes
- Clean, modular component architecture

## Data Flow

1. User creates account → Profile stored in database
2. Policy activated → Policy record created
3. Weather simulation runs → Weather events recorded
4. Risk calculation triggered → Risk assessment stored
5. Triggers checked → Claims auto-generated if thresholds met
6. Dashboard updates → Real-time display of all data

## Parametric Insurance Model

Unlike traditional insurance that requires claims investigation, this parametric model:
- Uses objective, measurable triggers
- Eliminates claim disputes
- Provides instant payouts
- Reduces administrative overhead
- Protects gig workers during adverse conditions

## Future Enhancements

- Integration with real weather APIs
- Machine learning model refinement
- Multi-city coverage expansion
- Mobile app development
- Payment gateway integration
- Historical analytics dashboard
