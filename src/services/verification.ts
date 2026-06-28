import { supabase } from '@/lib/supabase'

export interface VerificationRequest {
  id: string
  user_id?: string
  sitter_id?: string
  document_type: string
  document_url: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export const verificationService = {
  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    
    if (file.size > maxSize) {
      return { valid: false, error: 'حجم الملف كبير جداً. الحد الأقصى 5MB' }
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'نوع الملف غير مسموح به. الصور أو PDF فقط' }
    }
    
    return { valid: true }
  },

  // Upload verification document to storage
  async uploadDocument(userId: string, file: File, documentType: string): Promise<string> {
    const validation = this.validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${documentType}/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(fileName, file)
      
    if (uploadError) {
      throw uploadError
    }
    
    const { data } = supabase.storage
      .from('verification-docs')
      .getPublicUrl(fileName)
      
    return data.publicUrl
  },

  // Submit verification request (backwards compatible with sitter_id)
  async submitRequest(userId: string, documentType: string, documentUrl: string): Promise<void> {
    console.log('Submitting verification request:', { userId, documentType, documentUrl });
    // First try to find by user_id OR sitter_id
    let existing = null
    
    // Try user_id first
    const { data: existingByUser, error: findUserError } = await supabase
      .from('verification_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('document_type', documentType)
      .maybeSingle()
    
    console.log('Found by user_id:', existingByUser, 'Error:', findUserError);
      
    if (existingByUser) {
      existing = existingByUser
    } else {
      // Fallback to sitter_id
      const { data: existingBySitter, error: findSitterError } = await supabase
        .from('verification_requests')
        .select('id')
        .eq('sitter_id', userId)
        .eq('document_type', documentType)
        .maybeSingle()
      
      console.log('Found by sitter_id:', existingBySitter, 'Error:', findSitterError);
      existing = existingBySitter
    }
      
    if (existing) {
      console.log('Updating existing request:', existing.id);
      const { error } = await supabase
        .from('verification_requests')
        .update({
          document_url: documentUrl,
          status: 'pending',
          rejection_reason: null,
          reviewed_by: null,
          reviewed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
    } else {
      console.log('Inserting new request');
      // Try to insert with user_id first, fallback to sitter_id
      try {
        const { error } = await supabase
          .from('verification_requests')
          .insert({
            user_id: userId,
            document_type: documentType,
            document_url: documentUrl,
            status: 'pending'
          }).select();
          
        if (error) {
          console.error('Insert with user_id error:', error);
          throw error;
        }
      } catch (userError) {
        console.log('Falling back to sitter_id');
        // If user_id fails, try sitter_id
        const { error: sitterError } = await supabase
          .from('verification_requests')
          .insert({
            sitter_id: userId,
            document_type: documentType,
            document_url: documentUrl,
            status: 'pending'
          }).select();
          
        if (sitterError) {
          console.error('Insert with sitter_id error:', sitterError);
          throw sitterError;
        }
      }
    }
  },

  // Get all verification requests for user (backwards compatible with sitter_id)
  async getUserRequests(userId: string): Promise<VerificationRequest[]> {
    console.log('Getting user requests for:', userId);
    // Get requests where user_id OR sitter_id matches
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .or(`user_id.eq.${userId},sitter_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    console.log('Requests found:', data, 'Error:', error);
    if (error) {
      console.error('Get requests error:', error);
      return [];
    }
      
    return data || []
  }
}
