const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { request, gql } = require('graphql-request');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// GraphQL queries
const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    users(where: {email: {_eq: $email}}) {
      id
      email
      password
      name
      created_at
      updated_at
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($email: String!, $password: String!, $name: String!) {
    insert_users_one(object: {email: $email, password: $password, name: $name}) {
      id
      email
      name
      created_at
    }
  }
`;

// Helper function to generate JWT
const generateJWT = (userId, email, name) => {
  const payload = {
    'https://hasura.io/jwt/claims': {
      'x-hasura-allowed-roles': ['user', 'anonymous'],
      'x-hasura-default-role': 'user',
      'x-hasura-user-id': userId.toString()
    },
    sub: userId.toString(),
    email,
    name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
};

// Register endpoint
app.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUserResponse = await request(
      process.env.HASURA_ENDPOINT,
      GET_USER_BY_EMAIL,
      { email },
      { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET }
    );

    if (existingUserResponse.users.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const createUserResponse = await request(
      process.env.HASURA_ENDPOINT,
      CREATE_USER,
      { email, password: hashedPassword, name },
      { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET }
    );

    const newUser = createUserResponse.insert_users_one;
    const token = generateJWT(newUser.id, newUser.email, newUser.name);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Get user from database
    const response = await request(
      process.env.HASURA_ENDPOINT,
      GET_USER_BY_EMAIL,
      { email },
      { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET }
    );

    const user = response.users[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateJWT(user.id, user.email, user.name);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Token verification endpoint
app.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });

  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'SafeTrust Auth Service' });
});

app.listen(PORT, () => {
  console.log(`SafeTrust Auth Service running on port ${PORT}`);
});