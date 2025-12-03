/**
 * Document Flow Models and Interfaces
 * These models represent the API response structure and internal graph data
 */

export interface DocumentFlowApiResponse {
  value: DocumentFlowRelation[];
}

export interface DocumentFlowRelation {
  id: string;
  objectId: string;
  objectDisplayId: string;
  objectType: string;
  role: 'SUCCESSOR' | 'PREDECESSOR';
  relatedObjectType: string;
  relatedObjectId: string;
  relatedObjectDisplayId: string;
  adminData: AdminData;
}

export interface AdminData {
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
}

export interface DocumentNode {
  id: string;
  label: string;
  status: 'success' | 'warning' | 'error' | 'neutral';
  icon: string;
  objectType: string;
  objectDisplayId: string;
  objectId: string;
  isCurrent?: boolean;
  hasMoreRelations?: boolean;
  isExpanded?: boolean;
  isCheckingRelations?: boolean;
  dimension?: {
    width: number;
    height: number;
  };
}

export interface DocumentLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: DocumentNode[];
  links: DocumentLink[];
}

/**
 * Object Type Mapping
 * Maps SAP object type codes to human-readable names and icons
 */
export const OBJECT_TYPE_MAPPING: { [key: string]: { name: string; icon: string } } = {
  '12': { name: 'Appointment', icon: 'appointment' },
  '30': { name: 'Quote', icon: 'sales-quote' },
  '64': { name: 'Lead', icon: 'leads' },
  '72': { name: 'Opportunity', icon: 'opportunity' },
  '80': { name: 'Sales Order', icon: 'sales-order' },
  '86': { name: 'Phone Call', icon: 'phone' },
  '90': { name: 'Outbound Delivery', icon: 'shipping-status' },
  '100': { name: 'Invoice', icon: 'document' },
  '110': { name: 'Accounting Doc', icon: 'account' },
  '542': { name: 'Task', icon: 'task' },
  '2054': { name: 'Visit', icon: 'visits' },
  '2059': { name: 'Sales Order', icon: 'sales-order' },
  '2886': { name: 'Case', icon: 'customer-and-contacts' },
};

/**
 * Routing Key Mapping for Navigation
 * Maps SAP object type codes to routing keys for quickview navigation
 */
export const ROUTING_KEY_MAPPING: { [key: string]: string } = {
  '12': 'appointment',
  '30': 'sales-quote',
  '64': 'lead',
  '72': 'guidedselling',
  '80': 'sales-order',
  '86': 'phone',
  '90': 'delivery',
  '100': 'invoice',
  '110': 'accounting',
  '542': 'task',
  '2054': 'visit',
  '2059': 'sales-order',
  '2886': 'case',
};

/**
 * Status assignment based on object type (can be customized based on business logic)
 */
export const STATUS_MAPPING: { [key: string]: 'success' | 'warning' | 'error' | 'neutral' } = {
  '12': 'neutral',
  '30': 'warning',
  '64': 'neutral',
  '72': 'success',
  '80': 'success',
  '86': 'neutral',
  '90': 'warning',
  '100': 'success',
  '110': 'error',
  '542': 'neutral',
  '2054': 'neutral',
  '2059': 'success',
  '2886': 'warning',
};
