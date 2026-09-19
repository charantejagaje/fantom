import { User, WorkerUser, UserRole } from '../types';
import { DEMO_CREDENTIALS, DemoCredential } from '../data/authData';

export class AuthService {
  static getDemoCredentials(): DemoCredential[] {
    return DEMO_CREDENTIALS;
  }

  static findCredentialByEmail(email: string): DemoCredential | undefined {
    return DEMO_CREDENTIALS.find(
      (c) => c.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
  }

  static authenticate(email: string, password?: string): { success: boolean; user?: User | WorkerUser; error?: string } {
    const cred = this.findCredentialByEmail(email);
    if (!cred) {
      return { success: false, error: 'Invalid email address. Please use one of the demo accounts.' };
    }

    // In demo mode, if password is provided check it; otherwise allow instant demo login
    if (password && password !== cred.password) {
      return { success: false, error: `Invalid password. Demo password is "${cred.password}".` };
    }

    return { success: true, user: cred.user };
  }

  static hasRole(user: User | null, requiredRole: UserRole): boolean {
    if (!user) return false;
    return user.role === requiredRole;
  }

  static canAccess(user: User | null, action: 'ADMIN_FINANCIAL' | 'ENGINEERING_SIMULATION' | 'FIELD_TASK_EXECUTION'): boolean {
    if (!user) return false;
    switch (action) {
      case 'ADMIN_FINANCIAL':
        return user.role === 'OWNER';
      case 'ENGINEERING_SIMULATION':
        return user.role === 'ENGINEER' || user.role === 'OWNER';
      case 'FIELD_TASK_EXECUTION':
        return user.role === 'WORKER';
      default:
        return false;
    }
  }
}
