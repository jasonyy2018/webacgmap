export type WebNeedType = 
    | 'NO_WEBSITE'              // Missing website entirely
    | 'MOBILE_UNFRIENDLY'       // Broken or non-responsive mobile layout
    | 'LEGACY_TECH_DEBT'        // Outdated CMS, HTTP insecure, slow load
    | 'LOW_CONVERSION_DESIGN'   // Outdated visual design, missing CTA
    | 'HEALTHY';                // Modern and well optimized

export type PipelineStage = 
    | 'discovered'       // Newly found from Google Maps
    | 'audited'          // AI Website audit completed
    | 'greeting_sent'    // Stage 1: Initial warm greeting sent
    | 'followup_sent'    // Stage 2/3: Value proposal & follow up sent
    | 'replied'          // Customer replied
    | 'meeting_booked'   // Strategy call or Demo booked
    | 'closed_won'       // Deal closed
    | 'ignored';         // Archived or opted out

export interface OutreachSequenceStep {
    stage: 'stage_1_greeting' | 'stage_2_case_study' | 'stage_3_soft_cta' | 'stage_4_breakup';
    title: string;
    description: string;
    recommendedDelayDays: number;
    defaultSubject: string;
    content: string;
}

export interface LeadAnalysis {
    id?: number;
    lead_id?: number;
    tech_stack: string[];
    ux_assessment?: string;
    mobile_friendly?: boolean;
    business_insight?: string;
    detailed_analysis?: string;
    ai_confidence?: number;
    generated_email?: string;
    email_subjects?: string[];
    poster_description?: string;
    poster_url?: string;
    
    // Enhanced EDM fields
    need_category?: WebNeedType;
    need_urgency?: 'urgent' | 'high' | 'medium' | 'low';
    load_speed_score?: number;
    mobile_score?: number;
    seo_score?: number;
    estimated_lost_visitors_monthly?: number;
    custom_greeting?: string;
    personalized_hook?: string;
    email_sequence?: OutreachSequenceStep[];
}

export interface Lead {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    website?: string;
    contact_email?: string;
    rating?: number;
    place_id?: string;
    search_query?: string;
    search_location?: string;
    industry?: string;
    ai_score?: number;
    ai_grade?: string;
    ai_status: 'pending' | 'analyzing' | 'completed' | 'failed' | string;
    ai_tags: string[];
    status: 'pending' | 'analyzed' | 'contacted' | 'ignored' | string;
    pipeline_stage?: PipelineStage;
    contact_attempts?: number;
    last_contacted?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    analysis?: LeadAnalysis;
}

export interface EmailTemplate {
    id: string;
    name: string;
    category: 'executive' | 'diagnostic' | 'redesign' | 'local_reputation';
    subjectFormat: string;
    description: string;
    badge: string;
    previewHtml: (lead: Lead, customOptions?: Record<string, any>) => string;
    plainText: (lead: Lead, customOptions?: Record<string, any>) => string;
}

export interface SearchParams {
    query: string;
    location?: string;
}

