
import { UsernameCheckResponse } from '../types';
import { TAKEN_USERNAMES } from '../constants';

// Regex Rules:
// - ^[a-z]: Must start with a lowercase letter
// - [a-z0-9._]: Body can contain lowercase letters, numbers, dots, underscore
// - {2,19}: Body length matches 2 to 19 characters (Total 3 to 20)
// - $: End of string
export const USERNAME_REGEX = /^[a-z][a-z0-9._]{2,19}$/;

const RESERVED_WORDS = [
  'admin', 'root', 'user', 'guest', 'support', 'help', 'system', 'moderator',
  'api', 'dashboard', 'login', 'logout', 'register', 'signin', 'signup',
  'about', 'contact', 'terms', 'privacy'
];

export class UsernameService {
  /**
   * Mock Backend API for checking username availability
   */
  async checkAvailability(username: string): Promise<UsernameCheckResponse> {
    // 1. Sanitize
    const sanitized = username.toLowerCase().trim();

    // 2. Validate Format
    if (!USERNAME_REGEX.test(sanitized)) {
      return {
        isValid: false,
        isAvailable: false,
        error: 'Username must be 3-20 characters, start with a letter, and contain only letters, numbers, . or _',
        suggestions: []
      };
    }

    // 3. Check Reserved Words
    if (RESERVED_WORDS.includes(sanitized)) {
      return {
        isValid: false,
        isAvailable: false,
        error: 'This username is reserved by the system.',
        suggestions: this.generateSuggestions(sanitized)
      };
    }

    // 4. Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, 500));

    // 5. Check Availability (Mock Database)
    const isTaken = TAKEN_USERNAMES.includes(sanitized);

    if (isTaken) {
      return {
        isValid: true,
        isAvailable: false,
        error: 'Username is already taken.',
        suggestions: this.generateSuggestions(sanitized)
      };
    }

    return {
      isValid: true,
      isAvailable: true
    };
  }

  /**
   * Generates suggestions for a taken username
   */
  generateSuggestions(base: string): string[] {
    const suggestions: string[] = [];
    const baseClean = base.replace(/[^a-z0-9]/g, '').slice(0, 15); // Simplify base for suggestions
    
    // Strategy 1: Append number (e.g., alex123)
    const randomNum = Math.floor(Math.random() * 1000);
    suggestions.push(`${baseClean}${randomNum}`);

    // Strategy 2: Append current year (e.g., alex2024)
    const year = new Date().getFullYear();
    suggestions.push(`${baseClean}${year}`);

    // Strategy 3: Append underscore + number (e.g., alex_99)
    const randomShort = Math.floor(Math.random() * 99);
    suggestions.push(`${baseClean}_${randomShort}`);

    // Strategy 4: Localized context (e.g., alex_bd)
    suggestions.push(`${baseClean}_bd`);

    // Ensure suggestions are available (recursive check against mock db in real scenario)
    // Here we just filter out explicitly taken ones from our constant list
    return suggestions.filter(s => !TAKEN_USERNAMES.includes(s) && s.length <= 20);
  }
}

export const usernameService = new UsernameService();
