import { v7 as uuidv7 } from 'uuid';

/**
 * Generate UUID v7
 */
export function uuid(): string {
  return uuidv7();
}

/**
 * Generate message ID with timestamp
 */
export function messageId(): string {
  return `analytics-${Date.now()}-${uuid()}`;
}
