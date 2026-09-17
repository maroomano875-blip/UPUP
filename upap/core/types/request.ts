// ==========================================================
// أنواع الطلبات — كل طلب يمر بدورة حياة كاملة
// ==========================================================
import { RequestStatus } from "./agent";

export interface AgentRequest {
  id: string;
  agent_id: string;
  client_id: string;
  country: string;             // رمز الدولة: US, SA, SY...
  language: string;            // رمز اللغة: en-US, ar, ar-SA...
  input_data: {
    file_name?: string;
    file_type?: string;
    file_size_bytes?: number;
    extracted_text?: string;
    image_base64?: string;
    raw_json?: Record<string, unknown>;
  };
  output_data?: Record<string, unknown>;
  confidence_score?: number;
  status: RequestStatus;
  processing_time_ms?: number;
  created_at: string;
  updated_at: string;
}

// الحالات المتتالية لدورة الطلب
export const REQUEST_FLOW: RequestStatus[] = [
  "received",
  "parsing",
  "processing",
  "reviewing",
  "delivered",
];
