import { isAuthorizedDashboardRequest, unauthorized } from "../_lib/auth.js";
import { sendJson, methodNotAllowed } from "../_lib/http.js";
import { getSupabaseAdminClient, isMissingTableError } from "../_lib/supabase.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    methodNotAllowed(res, "GET");
    return;
  }

  if (!isAuthorizedDashboardRequest(req)) {
    unauthorized(res);
    return;
  }

  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    sendJson(res, 500, {
      message: "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("registrations")
    .select(
      "registration_id, created_at, school_name, city, state, board, strength, principal_name, principal_email, principal_mobile, coordinator_name, coordinator_designation, coordinator_email, coordinator_mobile, expected_participants, exam_window",
    )
    .order("created_at", { ascending: false });

  if (error) {
    const message = isMissingTableError(error.message)
      ? "Supabase table registrations not found. Please run the schema SQL first."
      : `Supabase registration fetch failed: ${error.message}`;
    sendJson(res, 500, { message });
    return;
  }

  const registrations = (data || []).map((row) => ({
    registrationId: row.registration_id,
    createdAt: row.created_at,
    schoolName: row.school_name,
    city: row.city,
    state: row.state,
    board: row.board,
    strength: row.strength,
    principalName: row.principal_name,
    principalEmail: row.principal_email,
    principalMobile: row.principal_mobile,
    coordinatorName: row.coordinator_name,
    coordinatorDesignation: row.coordinator_designation,
    coordinatorEmail: row.coordinator_email,
    coordinatorMobile: row.coordinator_mobile,
    expectedParticipants: row.expected_participants,
    examWindow: row.exam_window,
  }));

  sendJson(res, 200, { registrations });
}
