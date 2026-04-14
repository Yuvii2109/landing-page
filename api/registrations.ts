import { randomUUID } from "node:crypto";
import type { RegistrationCreateRequest, RegistrationRecord } from "./_lib/types.js";
import { readJsonBody, sendJson, methodNotAllowed } from "./_lib/http.js";
import { getSupabaseAdminClient, isMissingTableError } from "./_lib/supabase.js";

const generateRegistrationId = () => {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const token = randomUUID().split("-")[0].toUpperCase();
  return `SPARK-${stamp}-${token}`;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    methodNotAllowed(res);
    return;
  }

  try {
    const payload = (await readJsonBody(req)) as RegistrationCreateRequest;

    const record: RegistrationRecord = {
      ...payload,
      registrationId: generateRegistrationId(),
      createdAt: new Date().toISOString(),
    };

    const supabaseAdmin = getSupabaseAdminClient();
    if (!supabaseAdmin) {
      sendJson(res, 500, {
        message: "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      });
      return;
    }

    const { error } = await supabaseAdmin.from("registrations").insert({
      registration_id: record.registrationId,
      created_at: record.createdAt,
      school_name: record.schoolName,
      school_address: record.schoolAddress,
      school_email: record.schoolEmail,
      school_phone: record.schoolPhone,
      city: record.city,
      state: record.state,
      board: record.board,
      strength: record.strength,
      lab_available: record.labAvailable,
      computer_count: record.computerCount,
      principal_name: record.principalName,
      principal_email: record.principalEmail,
      principal_mobile: record.principalMobile,
      coordinator_name: record.coordinatorName,
      coordinator_designation: record.coordinatorDesignation,
      coordinator_email: record.coordinatorEmail,
      coordinator_mobile: record.coordinatorMobile,
      expected_participants: record.expectedParticipants,
      exam_window: record.examWindow,
      declaration: record.declaration,
    });

    if (error) {
      const message = isMissingTableError(error.message)
        ? "Supabase table registrations not found. Please run the schema SQL first."
        : `Supabase registration save failed: ${error.message}`;
      sendJson(res, 500, { message });
      return;
    }

    sendJson(res, 201, record);
  } catch {
    sendJson(res, 500, { message: "Could not persist registration" });
  }
}
