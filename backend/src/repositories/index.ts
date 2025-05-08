import { UserRepository } from './UserRepository';
import { ProductRepository } from './ProductRepository';
import { SearchRepository } from './SearchRepository';

// Export repository instances
export const userRepository = new UserRepository();
export const productRepository = new ProductRepository();
export const searchRepository = new SearchRepository();

// Export repository classes
export { UserRepository } from './UserRepository';
export { ProductRepository } from './ProductRepository';
export { SearchRepository } from './SearchRepository';
