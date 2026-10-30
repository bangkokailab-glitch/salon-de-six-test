// No token or customer data is persisted to localStorage/sessionStorage.
// This is display metadata returned by the authenticated server, never a source
// of additional authority. Missing legacy metadata is explicitly unattributed.
export function validatedPublicPrincipal(value) {
  if (value === undefined) return { actorId: 'shared_test_admin', role: 'shared_admin', humanAttributed: false };
  const keys = ['actorId', 'role', 'humanAttributed'];
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== keys.length
    || keys.some(key => !Object.hasOwn(value, key)) || typeof value.actorId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(value.actorId)
    || !['shared_admin', 'owner', 'staff', 'participant'].includes(value.role) || typeof value.humanAttributed !== 'boolean'
    || (value.role === 'shared_admin' ? value.actorId !== 'shared_test_admin' || value.humanAttributed
      : value.actorId === 'shared_test_admin' || !value.humanAttributed)) throw new Error('invalid_response');
  return { actorId: value.actorId, role: value.role, humanAttributed: value.humanAttributed };
}
export function createTestClient({ apiOrigin = '', clientId = '', fetchImpl = fetch, now = () => Date.now() } = {}) {
  let origin = '';
  try { const u = new URL(apiOrigin); if (u.protocol === 'https:' && u.origin === apiOrigin && !u.username && !u.password) origin = apiOrigin; } catch {}
  const configured = !!origin && /^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId);
  let token = null, expiresAt = 0, challenge = null, generation = 0, conversationGeneration = 0;
  let state = { status: configured ? 'ready' : 'not_connected', principal: null, mode: null, customers: [], bookings: [], messages: [], error: null };
  const listeners = new Set();
  const emit = () => { for (const listener of listeners) listener(structuredClone(state)); };
  function clear(status, error = null) { generation++; conversationGeneration++; token = null; expiresAt = 0; challenge = null;
    state = { status, principal: null, mode: null, customers: [], bookings: [], messages: [], error }; emit(); }
  function expire() { if (token && now() >= expiresAt) clear('expired'); }
  async function call(path, { method = 'GET', body, authenticated = false } = {}) {
    if (!configured) throw new Error('not_connected');
    expire(); if (authenticated && !token) throw new Error('unauthorized');
    const current = generation;
    const response = await fetchImpl(origin + path, { method, credentials: 'omit', cache: 'no-store', redirect: 'error',
      signal: AbortSignal.timeout(path==='/api/test/operations/confirm'?45000:10000), headers: { ...(body ? { 'content-type': 'application/json' } : {}),
        ...(authenticated ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    if (current !== generation) throw new Error('stale_response');
    if (response.status === 401) { clear(path === '/auth/google' ? 'error' : 'expired'); throw new Error('unauthorized'); }
    if (!response.ok) { const failure=await response.json().catch(()=>({})); throw new Error(['disabled','not_found','stale_preview','preview_expired','target_busy','birthday_consent_required','gateway_write_key_invalid','private_write_key_invalid','write_key_not_separate','write_signature_mismatch','verification_requires_stopped','verification_scope_invalid'].includes(failure.error)?failure.error:response.status===503?'not_connected':'request_failed'); }
    const data = await response.json();
    if (current !== generation) throw new Error('stale_response');
    return data;
  }
  function dataError(error) { if (!['stale_response','unauthorized'].includes(error.message)) {
    state = { ...state, status: 'error', customers: [], bookings: [], messages: [], error: error.message }; emit();
  } }
  function projection(data, operation) {
    if (data?.version !== 1 || data.scope !== 'registered_test_customers' || data.operation !== operation || data.readOnly !== true) throw new Error('invalid_response');
    return data;
  }
  return {
    configured,
    isAuthenticated() { expire(); return token !== null; },
    snapshot() { expire(); return structuredClone(state); },
    subscribe(listener) { listeners.add(listener); listener(this.snapshot()); return () => listeners.delete(listener); },
    async beginSignIn() {
      if (!configured) throw new Error('not_connected');
      clear('signing_in');
      try { const value = await call('/auth/challenge', { method: 'POST', body: {} });
        if (value.clientId !== clientId || !/^[a-f0-9]{64}$/.test(value.challengeId || '') || !/^[a-f0-9]{64}$/.test(value.nonce || '')) throw new Error('invalid_response');
        challenge = value; return { clientId, nonce: value.nonce };
      } catch (error) { dataError(error); throw error; }
    },
    async completeSignIn(credential) {
      if (!challenge) throw new Error('invalid_login');
      try { const value = await call('/auth/google', { method: 'POST', body: { challengeId: challenge.challengeId, credential } });
        if (!/^[a-f0-9]{64}$/.test(value.token || '') || !Number.isFinite(value.expiresAt) || !['test_read_only','test_scoped_operations'].includes(value.mode)) throw new Error('invalid_response');
        const principal = validatedPublicPrincipal(value.principal);
        if (principal.role === 'participant' && value.mode !== 'test_read_only') throw new Error('invalid_response');
        const receivedAt = now();
        if (value.expiresAt <= receivedAt) throw new Error('session_expired');
        // The API enforces the real expiry. Allow bounded clock skew here,
        // but never retain browser data for longer than 15 local minutes.
        if (value.expiresAt > receivedAt + 900000 + 60000) throw new Error('session_clock_ahead');
        token = value.token; expiresAt = Math.min(value.expiresAt, receivedAt + 900000); challenge = null;
        state = { ...state, status: 'authenticated', principal, mode: value.mode, error: null }; emit();
      } catch (error) { dataError(error); throw error; }
    },
    async refresh() {
      conversationGeneration++;
      try { const current = generation; const [customerData, bookingData] = await Promise.all([
        call('/api/test/customers', { authenticated: true }), call('/api/test/bookings', { authenticated: true })]);
        if (current !== generation) return;
        const customers = projection(customerData, 'customers').customers, bookings = projection(bookingData, 'bookings').bookings;
        if (!Array.isArray(customers) || !Array.isArray(bookings)) throw new Error('invalid_response');
        state = { ...state, status: 'connected', customers, bookings, messages: [], conversationCustomerId: null, error: null }; emit();
      } catch (error) { dataError(error); throw error; }
    },
    async conversation(customerId) {
      if (!state.customers.some(x => x.id === customerId) || !/^[a-zA-Z0-9-]{1,64}$/.test(customerId)) throw new Error('not_found');
      const current = ++conversationGeneration;
      try { const data = projection(await call(`/api/test/customers/${encodeURIComponent(customerId)}/conversation`, { authenticated: true }), 'conversation');
        if (current !== conversationGeneration) throw new Error('stale_response');
        if (data.completeTranscript !== false || !Array.isArray(data.messages)) throw new Error('invalid_response');
        state = { ...state, messages: data.messages, conversationCustomerId: customerId }; emit();
      } catch (error) { if (current !== conversationGeneration) throw new Error('stale_response'); dataError(error); throw error; }
    },
    cancelConversation() { conversationGeneration++; state = { ...state, messages: [], conversationCustomerId: null }; emit(); },
    async operations(operation, body = {}) {
      if (!['preview','confirm','state','simulate','calendar','verify'].includes(operation)) throw new Error('not_found');
      expire();
      if (state.principal?.role === 'participant') throw new Error('disabled');
      const value=await call('/api/test/operations/'+operation,{method:'POST',body,authenticated:true});
      if(value?.version!==1||value.scope!=='registered_test_customers'||value.operation!==operation||value.customerNotified!==false)throw new Error('invalid_response');
      return value;
    },
    async logout() { const oldToken = token; clear(configured ? 'ready' : 'not_connected');
      if (!oldToken) return;
      try { await fetchImpl(origin + '/auth/logout', { method: 'POST', credentials: 'omit', redirect: 'error',
        signal: AbortSignal.timeout(5000), headers: { authorization: `Bearer ${oldToken}` } }); } catch { /* Local session always cleared; server session expires within 15 min. */ }
    },
  };
}
