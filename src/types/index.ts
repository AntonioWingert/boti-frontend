// Enums
export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  SUPERVISOR = 'SUPERVISOR'
}

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
  ESCALATED = 'ESCALATED'
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum MessageSender {
  CLIENT = 'CLIENT',
  SYSTEM = 'SYSTEM',
  AGENT = 'AGENT',
  CHATBOT = 'CHATBOT'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  STICKER = 'STICKER'
}

// Base types
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// Company
export interface Company extends BaseEntity {
  name: string
  email: string
  phone?: string
  address?: string
  active: boolean
}

export interface CreateCompanyDto {
  name: string
  email: string
  phone?: string
  address?: string
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {
  active?: boolean
}

// User
export interface User extends BaseEntity {
  name: string
  email: string
  role: Role
  active: boolean
  companyId: string
  company?: Company
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  role: Role
  companyId: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

// Client
export interface Client extends BaseEntity {
  name: string
  email?: string
  phone: string
  active: boolean
  companyId: string
  company?: Company
}

export interface CreateClientDto {
  name: string
  email?: string
  phone: string
  companyId: string
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
  active?: boolean
}

// Chatbot
export interface ChatbotConfig {
  respostaPadrao: string
  respostas: Record<string, string>
  escalarParaAtendente: string[]
}

export interface Chatbot extends BaseEntity {
  name: string
  description?: string
  active: boolean
  companyId: string
  company?: Company
  configuracao?: ChatbotConfig
}

export interface CreateChatbotDto {
  name: string
  description?: string
  companyId: string
  configuracao?: ChatbotConfig
}

export interface UpdateChatbotDto extends Partial<CreateChatbotDto> {
  active?: boolean
}

// Conversation
export interface Conversation extends BaseEntity {
  status: ConversationStatus
  priority: Priority
  escalated: boolean
  escalationReason?: string
  lastMessage?: string
  lastMessageAt?: string
  finishedAt?: string
  companyId: string
  clientId: string
  chatbotId?: string
  userId?: string
  company?: Company
  client?: Client
  chatbot?: Chatbot
  user?: User
}

export interface CreateConversationDto {
  clientId: string
  companyId: string
  chatbotId?: string
}

export interface UpdateConversationStatusDto {
  status: ConversationStatus
}

export interface EscalateConversationDto {
  reason: string
}

export interface AssignConversationDto {
  userId: string
}

// Message
export interface Message extends BaseEntity {
  content: string
  sender: MessageSender
  messageType: MessageType
  metadata?: any
  isRead: boolean
  isDelivered: boolean
  conversationId: string
  clientId: string
  companyId: string
  conversation?: Conversation
  client?: Client
  company?: Company
}

export interface CreateMessageDto {
  conversationId: string
  content: string
  sender: MessageSender
  messageType?: MessageType
  metadata?: any
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter types
export interface ConversationFilters {
  companyId?: string
  status?: ConversationStatus
  priority?: Priority
  escalated?: boolean
  userId?: string
  search?: string
  page?: number
  limit?: number
}

export interface ClientFilters {
  companyId?: string
  active?: boolean
  search?: string
  page?: number
  limit?: number
}
