export interface User {
  id: string;
  username: string;
  account_id: string;
  role: string;
}

export interface HostedZone {
  id: string;
  name: string;
  type: "Public" | "Private";
  comment: string | null;
  vpc_id: string | null;
  vpc_region: string | null;
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface HostedZoneListResponse {
  items: HostedZone[];
  total: number;
  offset: number;
  limit: number;
}

export type RecordType = "A" | "AAAA" | "CNAME" | "TXT" | "MX" | "NS" | "PTR" | "SRV" | "CAA" | "SOA";

export interface DNSRecord {
  id: string;
  hosted_zone_id: string;
  name: string;
  type: RecordType;
  ttl: number;
  values: string[];
  routing_policy: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface DNSRecordListResponse {
  items: DNSRecord[];
  total: number;
  offset: number;
  limit: number;
}
