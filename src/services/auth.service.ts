import { UserService } from './user.service';
import { signSession, SessionPayload } from '@/lib/session';

export class AuthService {
  static async login(username: string, password: string): Promise<string | null> {
    const found = await UserService.getByUsername(username);
    if (!found) return null;

    const valid = await UserService.verifyPassword(password, found.password);
    if (!valid) return null;

    const payload: SessionPayload = {
      userId: found.id,
      username: found.username,
      role: found.role as SessionPayload['role'],
    };

    return signSession(payload);
  }
}
