export type RegistrationPayload = {
  registrationId: string;
  schoolName: string;
  schoolAddress: string;
  schoolEmail: string;
  schoolPhone: string;
  city: string;
  state: string;
  board: string;
  strength: string;
  labAvailable: "yes" | "no";
  computerCount: string;
  principalName: string;
  principalEmail: string;
  principalMobile: string;
  coordinatorName: string;
  coordinatorDesignation: string;
  coordinatorEmail: string;
  coordinatorMobile: string;
  expectedParticipants: string;
  examWindow: string;
  declaration: boolean;
  createdAt: string;
};

export type RegistrationCreateRequest = Omit<RegistrationPayload, "registrationId" | "createdAt">;

export const REGISTRATION_STORAGE_KEY = "spark.registration.latest";

export const saveLatestRegistration = (payload: RegistrationPayload) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(payload));
};

export const readLatestRegistration = (): RegistrationPayload | null => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(REGISTRATION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as RegistrationPayload;
    if (!parsed?.registrationId || !parsed?.schoolName) return null;
    return parsed;
  } catch {
    return null;
  }
};
