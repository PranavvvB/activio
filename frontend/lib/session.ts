import {
  api,
  type Availability,
  type User,
  type UserActivity,
} from "./api-service";
import { ApiError } from "./api-client";
import { authStorage } from "./auth-storage";

export type SessionState = {
  authenticated: boolean;
  user: User | null;
  profileComplete: boolean;
};

export function isProfileComplete(
  user: User | null,
  activities: UserActivity[] = [],
  availability: Availability[] = [],
): boolean {
  return Boolean(
    user?.profile &&
    user.profile.display_name?.trim() &&
    user.profile.location_name?.trim() &&
    activities.length > 0 &&
    availability.length > 0,
  );
}

/** The API is the authority for both token validity and profile completeness. */
export async function getSessionState(): Promise<SessionState> {
  if (!authStorage.getToken()) {
    return { authenticated: false, user: null, profileComplete: false };
  }

  try {
    const user = await api.me();
    const [profile, activities, availability] = await Promise.all([
      api.profile().catch((error) => {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }),
      api.myActivities(),
      api.availability(),
    ]);
    const currentUser = profile ? { ...user, profile } : user;
    return {
      authenticated: true,
      user: currentUser,
      profileComplete: isProfileComplete(currentUser, activities, availability),
    };
  } catch {
    authStorage.clearToken();
    return { authenticated: false, user: null, profileComplete: false };
  }
}
