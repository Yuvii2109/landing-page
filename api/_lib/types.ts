export type RegistrationCreateRequest = {
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
};

export type RegistrationRecord = RegistrationCreateRequest & {
  registrationId: string;
  createdAt: string;
};

export type OtpSendRequest = {
  mobile: string;
  channel: "principal" | "coordinator";
};

export type OtpVerifyRequest = {
  mobile: string;
  otp: string;
  channel: "principal" | "coordinator";
};

export type OtpSession = {
  otpHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
};

export type OtpSessionRow = {
  session_key: string;
  channel: "principal" | "coordinator";
  mobile: string;
  otp_hash: string;
  expires_at: string;
  attempts: number;
  last_sent_at: string;
};

export type OtpGatewayConfig = {
  username?: string;
  password?: string;
  from: string;
  templateId?: string;
  principalEntityId?: string;
  telemarketerId?: string;
  otpTextTemplate: string;
};
