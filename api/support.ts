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

// ─── User Tickets List ───────────────────────────────────────────────────────

export interface TicketListItem {
  id: string;
  ticket_number: string;
  user_name: string;
  restaurant_name: string;
  issue_subject: string;
  status: string;
  priority: string;
  date: string;
}

export interface TicketsListResponse {
  total: number;
  page: number;
  page_size: number;
  pages: number;
  items: TicketListItem[];
}

export const getUserTickets = async (
  page = 1,
  pageSize = 10
): Promise<TicketsListResponse> => {
  const response = await apiClient.get<TicketsListResponse>(
    `/api/v1/support/user/tickets`,
    { params: { page, page_size: pageSize } }
  );
  return response.data;
};

// ─── Single Ticket Detail ────────────────────────────────────────────────────

export interface TicketMessage {
  author_name: string;
  author_role: string;
  body: string;
  is_internal: boolean;
  attachment_name: string | null;
  attachment_url: string | null;
  created_at: string;
}

export interface TicketDetail {
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
  messages: TicketMessage[];
}

export const getTicketById = async (ticketId: string): Promise<TicketDetail> => {
  const response = await apiClient.get<TicketDetail>(
    `/api/v1/support/user/tickets/${ticketId}`
  );
  return response.data;
};
