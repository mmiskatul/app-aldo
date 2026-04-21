import apiClient from './apiClient';

export interface CreateTicketPayload {
  subject: string;
  message: string;
  attachment_name?: string;
  attachment_url?: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  submitted_at: string;
  resolved_at: string | null;
  badges: { label: string; variant: string }[];
  customer: {
    user_name: string;
    email: string;
    phone: string;
    location: string | null;
    restaurant_name: string;
  };
  messages: {
    author_name: string;
    author_role: string;
    body: string;
    is_internal: boolean;
    attachment_name: string | null;
    attachment_url: string | null;
    created_at: string;
  }[];
}

export interface CreateTicketResponse {
  message: string;
  ticket: SupportTicket;
}

export const createSupportTicket = async (
  payload: CreateTicketPayload
): Promise<CreateTicketResponse> => {
  const response = await apiClient.post<CreateTicketResponse>(
    '/api/v1/support/tickets',
    payload
  );
  return response.data;
};
