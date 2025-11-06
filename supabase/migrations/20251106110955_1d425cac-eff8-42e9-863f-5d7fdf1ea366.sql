-- Enable RLS on email_send_log table
ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

-- Only service role and admins should access email logs
CREATE POLICY "Admins can view email logs"
ON public.email_send_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage email logs"
ON public.email_send_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);