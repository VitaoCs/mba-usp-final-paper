import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10, 
  duration: '30s',
  setupTimeout: '1m', // Allow more time for setup
};

const BASE_URL_PRODUCT = 'http://localhost:3001'
const BASE_URL_USER = 'http://localhost:3003'
const BASE_URL_ORDER = 'http://localhost:3002'

// Sample product and user data
const sampleProducts = [
  { name: 'Product 1', price: 25.99, description: 'Description for product 1' },
  { name: 'Product 2', price: 19.50, description: 'Description for product 2' },
];

const sampleUsers = [
  { name: 'User 1', email: 'user1@example.com', address: 'Address 1' },
  { name: 'User 2', email: 'user2@example.com', address: 'Address 2' },
];

export function setup() {
  console.log('Setting up the database...')

  for (const product of sampleProducts) {
    const res = http.post(`${BASE_URL_PRODUCT}/products`, JSON.stringify(product))
    check(res, {
      'Product created successfully': (r) => r.status === 201,
    });
  }

  for (const user of sampleUsers) {
    const res = http.post(`${BASE_URL_USER}/users`, JSON.stringify(user))
    check(res, {
      'User created successfully': (r) => r.status === 201,
    });
  }

  console.log('Database setup complete!')
}

export default function () {
    // Scenario 1: Browse product listings
    const productsResponse = http.get(`${BASE_URL_PRODUCT}/products`);
    check(productsResponse, {
      'Products fetched successfully': (r) => r.status === 200,
    });
  
    // Scenario 2: View a specific product
    const randomProductId = getRandomProductId(); // Helper function to get a random product ID from the setup
    const productDetailsResponse = http.get(`${BASE_URL_PRODUCT}/products/${randomProductId}`);
    check(productDetailsResponse, {
      'Product details fetched successfully': (r) => r.status === 200,
    });
  
    // Scenario 3: Create an order
    const randomUserId = getRandomUserId(); // Helper function to get a random user ID from the setup
    const newOrder = {
      user: randomUserId,
      products: [
        { product: getRandomProductId(), quantity: Math.floor(Math.random() * 3) + 1 }, // Random quantity between 1 and 3
        { product: getRandomProductId(), quantity: Math.floor(Math.random() * 3) + 1 }
      ]
    };
    const createOrderResponse = http.post(`${BASE_URL_ORDER}/orders`, JSON.stringify(newOrder));
    check(createOrderResponse, {
      'Order created successfully': (r) => r.status === 201,
    });
  
    // Scenario 4: Update user information
    const updatedUser = { 
      name: 'Updated User Name',
    };
    const updateResponse = http.put(`${BASE_URL_USER}/users/${randomUserId}`, JSON.stringify(updatedUser));
    check(updateResponse, {
      'User updated successfully': (r) => r.status === 200,
    });
  
    // Additional scenarios you can consider:
    // - Search for products
    // - Filter products by category or price range
    // - View order history for a user
    // - Update order status
    // - Delete a user or product (carefully, as it might impact other tests)
  
    sleep(1); 
  }
  
  // Helper functions to get random IDs from the setup data
  function getRandomProductId() {
    // ... implement logic to get a random product ID from sampleProducts
  }
  
  function getRandomUserId() {
    // ... implement logic to get a random user ID from sampleUsers
  }