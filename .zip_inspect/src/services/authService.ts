import { User, WorkerUser, UserRole } from '../types';
import { DEMO_CREDENTIALS, DemoCredential, DEMO_ENGINEER } from '../data/authData';

export class AuthService {
  static getDemoCredentials(): DemoCredential[] {
    return DEMO_CREDENTIALS;
  }

  static findCredentialByEmail(email: string): DemoCredential | undefined {
    const clean = email.toLowerCase().trim();
    return DEMO_CREDENTIALS.find(
      (c) => c.email.toLowerCase().trim() === clean || c.email.toLowerCase().split('@')[0] === clean
    );
  }

  static authenticate(email: string, password?: string): { success: boolean; user?: User | WorkerUser; error?: string } {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your username or email address.' };
    }
    if (!password || !password.trim()) {
      return { success: false, error: 'Please enter your password.' };
    }

    const cred = this.findCredentialByEmail(cleanEmail);
    if (cred) {
      // If matches a known account, accept password
      return { success: true, user: cred.user };
    }

    // Single login fallback: allow any valid username and password
    const rawName = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
    const formattedName = rawName.replace(/[._-]/g, ' ');
    const fallbackUser: User = {
      ...DEMO_ENGINEER,
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
      avatar: formattedName.slice(0, 2).toUpperCase(),
      email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@fantom.ai`
    };

    return { success: true, user: fallbackUser };
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
