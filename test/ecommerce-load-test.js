import http from 'k6/http';
import { sleep, check } from 'k6';

// Load test configuration
export const options = {
  vus: __ENV.VUS || 50,
  duration: __ENV.DURATION || '2m',
};

// Base URLs
const BASE_URL_PRODUCT = 'http://localhost:3001';
const BASE_URL_USER = 'http://localhost:3003';
const BASE_URL_ORDER = 'http://localhost:3002';

// Generate sample data
const generateSampleProducts = (count) =>
  Array.from({ length: count }, (_, i) => ({
    name: `Product ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
    price: parseFloat((Math.random() * 100).toFixed(2)),
    description: `Description for product ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
  }));

const generateSampleUsers = (count) =>
  Array.from({ length: count }, (_, i) => ({
    name: `User ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
    email: `user${i + 1}@example.com`,
    address: `Address ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
  }));

const sampleProducts = generateSampleProducts(100);
const sampleUsers = generateSampleUsers(100);

function createResources(data, url) {
  const ids = [];
  for (const item of data) {
    const res = http.post(url, JSON.stringify(item), {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, { [`Resource created at ${url}`]: (r) => r.status === 201 });
    if (res.status === 201) {
      ids.push(res.json('_id'));
    }
  }
  return ids;
}

function fetchResource(url, description) {
  const res = http.get(url);
  check(res, {
    [description]: (r) => r.status === 200,
    'Response time < 500ms': (r) => r.timings.duration < 500,
  });
  return res.json();
}

function fetchDeletedResource(url, description) {
  const res = http.get(url);
  check(res, {
    [description]: (r) => r.status === 404,
    'Response time < 500ms': (r) => r.timings.duration < 500,
  });
  return res.json();
}

function createOrder(productIds, userId) {
  const productCount = Math.floor(Math.random() * 3) + 2;
  const products = Array.from({ length: productCount }, () => ({
    product: productIds[Math.floor(Math.random() * productIds.length)],
    quantity: Math.floor(Math.random() * 3) + 1,
  }));

  const newOrder = { user: userId, products };
  const res = http.post(`${BASE_URL_ORDER}/orders`, JSON.stringify(newOrder), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'Order created': (r) => r.status === 201 });
  return res.json('_id');
}

function updateProductPrice(productId, newPrice) {
  const res = http.put(`${BASE_URL_PRODUCT}/products/${productId}`, JSON.stringify({ price: newPrice }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'Product price updated': (r) => r.status === 200 });
}

function deleteResource(url, description) {
  const res = http.del(url);
  check(res, { [description]: (r) => r.status === 200 });
}

function validateOrderTotal(orderId) {
  const order = fetchResource(`${BASE_URL_ORDER}/orders/${orderId}`, 'Fetched order details');
  let calculatedTotal = 0
  if(order.products && order.products.length > 0) {
    calculatedTotal = order.products.reduce((total, p) => {
      if(p && !p.product) return total
      return total + p.product.price * p.quantity
    }, 0);
  }
  check(order, { 'Order total price updated': () => order.totalPrice === calculatedTotal });
}

function updateUserDetails(userId, newDetails) {
  const res = http.put(`${BASE_URL_USER}/users/${userId}`, JSON.stringify(newDetails), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'User updated': (r) => r.status === 200 });
}

export function setup() {
  console.log('Setting up the database...');
  const productIds = createResources(sampleProducts, `${BASE_URL_PRODUCT}/products`);
  const userIds = createResources(sampleUsers, `${BASE_URL_USER}/users`);
  const orderIds = userIds.map((userId) => createOrder(productIds, userId));

  return { productIds, userIds, orderIds };
}

export default function (data) {
  const { productIds, userIds, orderIds } = data;

  // Creating destructive user and product
  const destructiveUser = createResources(
    generateSampleUsers(1), 
    `${BASE_URL_USER}/users`
  )[0]

  const destructiveProduct = createResources(
    generateSampleProducts(1), 
    `${BASE_URL_PRODUCT}/products`
  )[0];

  const destructiveOrder = createOrder([destructiveProduct, ...productIds], destructiveUser)

  // Scenario 1: Update product price and validate order total
  const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
  updateProductPrice(randomProductId, 50.0);
  sleep(1); // Simulate real-world think time
  validateOrderTotal(orderIds[Math.floor(Math.random() * orderIds.length)]);

  // Scenario 2: Update user details and validate order
  const userIndex = Math.floor(Math.random() * userIds.length)
  const randomUserId = userIds[userIndex];
  updateUserDetails(randomUserId, { name: 'Updated User', address: 'Updated Address', email: 'updated_email@example.com' });

  const order = fetchResource(`${BASE_URL_ORDER}/orders/${orderIds[userIndex]}`, 'Fetched order');
  check(order, {
    'Order reflects updated user name': () => order.user.name === 'Updated User',
    'Order reflects updated user address': () => order.user.address === 'Updated Address',
    'Order reflects updated user address': () => order.user.email === 'updated_email@example.com',
  });

  // Scenario 3: Safely delete a product and validate order update
  deleteResource(`${BASE_URL_PRODUCT}/products/${destructiveProduct}`, 'Product deleted');
  sleep(1); // Simulate real-world think time
  validateOrderTotal(destructiveOrder);

  // Scenario 4: Safely delete a user and validate orders
  fetchResource(`${BASE_URL_ORDER}/orders/${destructiveOrder}`, 'Order fetch for destructive user').user === destructiveUser;
  deleteResource(`${BASE_URL_USER}/users/${destructiveUser}`, 'User deleted');
  sleep(1); // Simulate real-world think time
  const userOrders = fetchDeletedResource(`${BASE_URL_ORDER}/orders/${destructiveOrder}`, 'Order fetch after user deletion');
  check(userOrders, { 'All orders for deleted user removed': () => userOrders.error === 'Order not found' });

  sleep(1); // Simulate real-world think time
}
