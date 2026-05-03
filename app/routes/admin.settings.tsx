import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { useState } from 'react';
import { Save, Shield, Mail, Search, AlertTriangle, Plus, X, Eye, EyeOff, Activity, Code2 } from 'lucide-react';
import { getSettings, updateSettings, getActivity } from '~/lib/admin/data.server';

export async function loader() {
  const s = getSettings();
  const auditLog = getActivity(50);
  return json({ ...s, auditLog });
}

export async function action({ request }: ActionFunctionArgs) {
  const fd = await request.formData();
  const formData = fd as unknown as { get(name: string): FormDataEntryValue | null };
  const act = fd.get('action') as string;
  if (act === 'saveMaintenance') updateSettings({ maintenanceMode: formData.get('maintenanceMode') === 'on', announcementEnabled: formData.get('announcementEnabled') === 'on', announcementBanner: formData.get('announcementBanner') as string });
  if (act === 'saveEmail') updateSettings({ smtpHost: formData.get('smtpHost') as string, smtpPort: parseInt(formData.get('smtpPort') as string), smtpUser: formData.get('smtpUser') as string, smtpPassword: formData.get('smtpPassword') as string, resendApiKey: formData.get('resendApiKey') as string });
  if (act === 'saveSEO') updateSettings({ seoTitle: formData.get('seoTitle') as string, seoDescription: formData.get('seoDescription') as string, seoKeywords: formData.get('seoKeywords') as string, googleAnalyticsId: formData.get('googleAnalyticsId') as string, googleTagManagerId: formData.get('googleTagManagerId') as string });
  if (act === 'saveSecurity') updateSettings({ rateLimitRequests: parseInt(formData.get('rateLimitRequests') as string), rateLimitWindow: parseInt(formData.get('rateLimitWindow') as string), captchaEnabled: formData.get('captchaEnabled') === 'on', captchaSiteKey: formData.get('captchaSiteKey') as string, captchaSecretKey: formData.get('captchaSecretKey') as string, gdprEnabled: formData.get('gdprEnabled') === 'on', auditLogEnabled: formData.get('auditLogEnabled') === 'on', webhookUrl: formData.get('webhookUrl') as string });
  if (act === 'saveDatabase') updateSettings({
    supabaseUrl: formData.get('supabaseUrl') as string,
    supabaseAnonKey: formData.get('supabaseAnonKey') as string,
    redisUrl: formData.get('redisUrl') as string,
    githubToken: formData.get('githubToken') as string,
  });
  if (act === 'saveCustomCode') updateSettings({ customHeadCode: formData.get('customHeadCode') as string, customBodyCode: formData.get('customBodyCode') as string, oauthRedirectUrl: formData.get('oauthRedirectUrl') as string, loginCallbackUrl: formData.get('loginCallbackUrl') as string, googleClientId: formData.get('googleClientId') as string, googleClientSecret: formData.get('googleClientSecret') as string, githubClientId: formData.get('githubClientId') as string, githubClientSecret: formData.get('githubClientSecret') as string, googleLoginEnabled: formData.get('googleLoginEnabled') === 'on', githubLoginEnabled: formData.get('githubLoginEnabled') === 'on' });
  if (act === 'addIPWhitelist') { const c = getSettings(); const ip = formData.get('ip') as string; if (ip && !c.ipWhitelist.includes(ip)) updateSettings({ ipWhitelist: [...c.ipWhitelist, ip] }); }
  if (act === 'removeIPWhitelist') { const c = getSettings(); updateSettings({ ipWhitelist: c.ipWhitelist.filter(i => i !== formData.get('ip')) }); }
  if (act === 'addIPBlacklist') { const c = getSettings(); const ip = formData.get('ip') as string; if (ip && !c.ipBlacklist.includes(ip)) updateSettings({ ipBlacklist: [...c.ipBlacklist, ip] }); }
  if (act === 'removeIPBlacklist') { const c = getSettings(); updateSettings({ ipBlacklist: c.ipBlacklist.filter(i => i !== formData.get('ip')) }); }
  return json({ ok: true, message: 'Settings saved successfully' });
}

function Toggle({ name, defaultChecked, label, desc }: { name: string; defaultChecked: boolean; label: string; desc?: string }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <div className="relative ml-4 flex-shrink-0" onClick={() => setOn(v => !v)}>
        <input type="checkbox" name={name} checked={on} onChange={() => {}} className="sr-only" />
        <div className={`w-11 h-6 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-slate-300'}`} />
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
      </div>
    </label>
  );
}

function MaskedField({ name, defaultValue, placeholder }: { name: string; defaultValue: string; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} name={name} defaultValue={defaultValue} placeholder={placeholder} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
      <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

const activityColors: Record<string, string> = {
  admin_action: 'bg-blue-50 border-blue-100 text-blue-700',
  error: 'bg-red-50 border-red-100 text-red-700',
  payment: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  user_signup: 'bg-purple-50 border-purple-100 text-purple-700',
};

export default function AdminSettings() {
  const s = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ ok: boolean; message: string }>();
  const [tab, setTab] = useState<'maintenance' | 'email' | 'database' | 'security' | 'seo' | 'custom' | 'ip' | 'audit'>('maintenance');
  const [newWhiteIP, setNewWhiteIP] = useState('');
  const [newBlackIP, setNewBlackIP] = useState('');

  const tabs = [
    { id: 'maintenance', label: 'General' }, { id: 'email', label: 'Email / SMTP' },
    { id: 'database', label: 'Database' }, { id: 'security', label: 'Security' },
    { id: 'seo', label: 'SEO' }, { id: 'custom', label: 'Custom Code' },
    { id: 'ip', label: 'IP Control' },
    { id: 'audit', label: 'Audit Log' },
  ] as const;

  const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5";
  const saveBtnCls = "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm";
  const cardCls = "bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm";
  const codeCls = "w-full min-h-40 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto shadow-sm">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 min-w-max px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {fetcher.data?.ok && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800 font-medium">✓ {fetcher.data.message}</div>
      )}

      {tab === 'custom' && (
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="action" value="saveCustomCode" />
          <div className={cardCls}>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Code2 className="w-4 h-4 text-blue-600" /> Custom Code Snippets</h3>
              <p className="text-xs text-slate-400 mt-0.5">Paste analytics, pixels, auth callback URLs, verification tags, head scripts, or body embeds.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div><label className={labelCls}>Google Analytics ID</label><input type="text" name="googleAnalyticsId" defaultValue={s.googleAnalyticsId} placeholder="G-XXXXXXXXXX" className={inputCls} /></div>
              <div><label className={labelCls}>Google Tag Manager ID</label><input type="text" name="googleTagManagerId" defaultValue={s.googleTagManagerId} placeholder="GTM-XXXXXXX" className={inputCls} /></div>
              <div><label className={labelCls}>Google Login Client ID</label><input type="text" name="googleClientId" defaultValue={s.googleClientId} placeholder="xxxx.apps.googleusercontent.com" className={inputCls} /></div>
              <div><label className={labelCls}>Google Login Client Secret</label><MaskedField name="googleClientSecret" defaultValue={s.googleClientSecret} placeholder="••••••••" /></div>
              <div><label className={labelCls}>GitHub Client ID</label><input type="text" name="githubClientId" defaultValue={s.githubClientId} placeholder="Iv1.xxxxx" className={inputCls} /></div>
              <div><label className={labelCls}>GitHub Client Secret</label><MaskedField name="githubClientSecret" defaultValue={s.githubClientSecret} placeholder="••••••••" /></div>
              <div><label className={labelCls}>OAuth Redirect URL</label><input type="url" name="oauthRedirectUrl" defaultValue={s.oauthRedirectUrl} placeholder="https://yourdomain.com/auth/callback" className={inputCls} /></div>
              <div><label className={labelCls}>Login Callback URL</label><input type="url" name="loginCallbackUrl" defaultValue={s.loginCallbackUrl} placeholder="https://yourdomain.com/login/callback" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>Custom Head Code</label>
                <textarea name="customHeadCode" defaultValue={s.customHeadCode} placeholder="<script>...</script>" className={codeCls} spellCheck={false} />
              </div>
              <div>
                <label className={labelCls}>Custom Body Code</label>
                <textarea name="customBodyCode" defaultValue={s.customBodyCode} placeholder="<noscript>...</noscript>" className={codeCls} spellCheck={false} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Toggle name="googleLoginEnabled" defaultChecked={s.googleLoginEnabled} label="Enable Google Login" desc="Show Google sign-in in the auth flow" />
              <Toggle name="githubLoginEnabled" defaultChecked={s.githubLoginEnabled} label="Enable GitHub Login" desc="Show GitHub sign-in in the auth flow" />
            </div>
          </div>
          <button type="submit" className={saveBtnCls}><Save className="w-4 h-4" /> Save Custom Code</button>
        </fetcher.Form>
      )}

      {tab === 'maintenance' && (
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="action" value="saveMaintenance" />
          <div className={cardCls}>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> General Settings</h3>
            <div className="space-y-2">
              <Toggle name="maintenanceMode" defaultChecked={s.maintenanceMode} label="Maintenance Mode" desc="When ON, users see a maintenance page. Admins still have full access." />
              <Toggle name="announcementEnabled" defaultChecked={s.announcementEnabled} label="Show Announcement Banner" desc="Display a banner across the site for all logged-in users" />
            </div>
            <div>
              <label className={labelCls}>Announcement Banner Text</label>
              <input type="text" name="announcementBanner" defaultValue={s.announcementBanner} placeholder="🚀 New features released! Check out what's new..." className={inputCls} />
            </div>
          </div>
          <button type="submit" className={saveBtnCls}><Save className="w-4 h-4" /> Save</button>
        </fetcher.Form>
      )}

      {tab === 'email' && (
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="action" value="saveEmail" />
          <div className={cardCls}>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600" /> SMTP Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>SMTP Host</label><input type="text" name="smtpHost" defaultValue={s.smtpHost} placeholder="smtp.gmail.com" className={inputCls} /></div>
              <div><label className={labelCls}>SMTP Port</label><input type="number" name="smtpPort" defaultValue={s.smtpPort} className={inputCls} /></div>
              <div><label className={labelCls}>SMTP Username</label><input type="text" name="smtpUser" defaultValue={s.smtpUser} placeholder="your@email.com" className={inputCls} /></div>
              <div><label className={labelCls}>SMTP Password</label><MaskedField name="smtpPassword" defaultValue={s.smtpPassword} placeholder="••••••••" /></div>
            </div>
          </div>
          <div className={cardCls}>
            <h3 className="text-sm font-bold text-slate-900">✉️ Resend (Transactional Email)</h3>
            <div><label className={labelCls}>Resend API Key</label><MaskedField name="resendApiKey" defaultValue={s.resendApiKey} placeholder="re_..." /></div>
          </div>
          <button type="submit" className={saveBtnCls}><Save className="w-4 h-4" /> Save Email Settings</button>
        </fetcher.Form>
      )}

      {tab === 'database' && (
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="action" value="saveDatabase" />
          <div className={cardCls}>
            <h3 className="text-sm font-bold text-slate-900">🗄️ Supabase (PostgreSQL)</h3>
            <div><label className={labelCls}>Supabase URL</label><input type="text" name="supabaseUrl" defaultValue={s.supabaseUrl} placeholder="https://xyz.supabase.co" className={inputCls} /></div>
            <div><label className={labelCls}>Supabase Anon Key</label><MaskedField name="supabaseAnonKey" defaultValue={s.supabaseAnonKey} placeholder="eyJ..." /></div>
            <div><label className={labelCls}>GitHub Token</label><MaskedField name="githubToken" defaultValue={s.githubToken} placeholder="ghp_..." /></div>
          </div>
          <div className={cardCls}>
            <h3 className="text-sm font-bold text-slate-900">⚡ Redis (Upstash / Rate Limiting)</h3>
            <div><label className={labelCls}>Redis URL</label><MaskedField name="redisUrl" defaultValue={s.redisUrl} placeholder="rediss://..." /></div>
          </div>
          <button type="submit" className={saveBtnCls}><Save className="w-4 h-4" /> Save Database Settings</button>
        </fetcher.Form>
      )}

      {tab === 'security' && (
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="action" value="saveSecurity" />
          <div className={cardCls}>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-600" /> Rate Limiting</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Max Requests</label><input type="number" name="rateLimitRequests" defaultValue={s.rateLimitRequests} className={inputCls} /></div>
              <div><label className={labelCls}>Per Seconds (window)</label><input type="number" name="rateLimitWindow" defaultValue={s.rateLimitWindow} className={inputCls} /></div>
            </div>
            <p className="text-xs text-slate-400">Currently: max <strong className="text-slate-600">{s.rateLimitRequests}</strong> requests per <strong className="text-slate-600">{s.rateLimitWindow}s</strong></p>
          </div>
          <div className={cardCls}>
            <h3 className="text-sm font-bold text-slate-900">🤖 CAPTCHA (reCAPTCHA v3)</h3>
            <Toggle name="captchaEnabled" defaultChecked={s.captchaEnabled} label="Enable CAPTCHA" desc="Protect login, signup, and API endpoints" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Site Key</label><input type="text" name="captchaSiteKey" defaultValue={s.captchaSiteKey} placeholder="6Lc..." className={inputCls} /></div>
              <div><label className={labelCls}>Secret Key</label><MaskedField name="captchaSecretKey" defaultValue={s.captchaSecretKey} placeholder="6Lc..." /></div>
            </div>
          </div>
          <div className={cardCls}>
            <h3 className="text-sm font-bold text-slate-900">Compliance & Monitoring</h3>
            <div className="space-y-2">
              <Toggle name="gdprEnabled" defaultChecked={s.gdprEnabled} label="GDPR Compliance" desc="Enable data export and deletion for users (required in EU)" />
              <Toggle name="auditLogEnabled" defaultChecked={s.auditLogEnabled} label="Admin Audit Log" desc="Log all admin actions for security compliance" />
            </div>
            <div><label className={labelCls}>Webhook URL (Slack/Discord alerts)</label><input type="url" name="webhookUrl" defaultValue={s.webhookUrl} placeholder="https://hooks.slack.com/..." className={inputCls} /></div>
          </div>
          <button type="submit" className={saveBtnCls}><Save className="w-4 h-4" /> Save Security Settings</button>
        </fetcher.Form>
      )}

      {tab === 'seo' && (
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="action" value="saveSEO" />
          <div className={cardCls}>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Search className="w-4 h-4 text-blue-600" /> SEO & Meta Settings</h3>
            <div><label className={labelCls}>Site Title</label><input type="text" name="seoTitle" defaultValue={s.seoTitle} className={inputCls} /></div>
            <div><label className={labelCls}>Meta Description</label><textarea name="seoDescription" defaultValue={s.seoDescription} rows={3} className={`${inputCls} resize-none`} /></div>
            <div><label className={labelCls}>Keywords (comma separated)</label><input type="text" name="seoKeywords" defaultValue={s.seoKeywords} className={inputCls} /></div>
            <div><label className={labelCls}>Google Analytics ID</label><input type="text" name="googleAnalyticsId" defaultValue={s.googleAnalyticsId} placeholder="G-XXXXXXXXXX" className={inputCls} /></div>
            <div><label className={labelCls}>Google Tag Manager ID</label><input type="text" name="googleTagManagerId" defaultValue={s.googleTagManagerId} placeholder="GTM-XXXXXXX" className={inputCls} /></div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2">Google Preview:</p>
              <p className="text-blue-700 text-sm font-semibold">{s.seoTitle}</p>
              <p className="text-green-700 text-xs">https://zerobuild.io</p>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">{s.seoDescription || 'No description set'}</p>
            </div>
          </div>
          <button type="submit" className={saveBtnCls}><Save className="w-4 h-4" /> Save SEO Settings</button>
        </fetcher.Form>
      )}

      {tab === 'ip' && (
        <div className="space-y-4">
          {[
            { title: '✅ IP Whitelist', desc: 'Only these IPs can access the admin panel. Leave empty for open access.', list: s.ipWhitelist, addAction: 'addIPWhitelist', removeAction: 'removeIPWhitelist', val: newWhiteIP, setVal: setNewWhiteIP, color: 'emerald' },
            { title: '🚫 IP Blacklist', desc: 'Block these IPs from accessing the platform entirely.', list: s.ipBlacklist, addAction: 'addIPBlacklist', removeAction: 'removeIPBlacklist', val: newBlackIP, setVal: setNewBlackIP, color: 'red' },
          ].map(section => (
            <div key={section.addAction} className={cardCls}>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{section.desc}</p>
              </div>
              <fetcher.Form method="post" className="flex gap-2">
                <input type="hidden" name="action" value={section.addAction} />
                <input type="text" name="ip" placeholder="192.168.1.1 or 10.0.0.0/24" value={section.val} onChange={e => section.setVal(e.target.value)} className={`${inputCls} flex-1 font-mono`} />
                <button type="submit" onClick={() => section.setVal('')} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm whitespace-nowrap">
                  <Plus className="w-4 h-4" /> Add IP
                </button>
              </fetcher.Form>
              <div className="space-y-2">
                {section.list.length === 0
                  ? <p className="text-xs text-slate-400 italic bg-slate-50 rounded-lg p-3 border border-slate-100">No IPs added yet</p>
                  : section.list.map(ip => (
                    <fetcher.Form key={ip} method="post" className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5 border border-slate-100">
                      <input type="hidden" name="action" value={section.removeAction} />
                      <input type="hidden" name="ip" value={ip} />
                      <span className="text-xs font-mono font-semibold text-slate-800">{ip}</span>
                      <button type="submit" className="text-slate-400 hover:text-red-500 transition-colors ml-4"><X className="w-3.5 h-3.5" /></button>
                    </fetcher.Form>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-600" /> Admin Audit Log</h3>
            <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-full">{s.auditLog.length} entries</span>
          </div>
          {s.auditLog.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No admin actions logged yet</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {s.auditLog.map(entry => (
                <div key={entry.id} className={`flex items-start gap-3 px-5 py-3 ${activityColors[entry.type] || 'bg-white'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{entry.message}</p>
                    {entry.userEmail && <p className="text-[10px] opacity-70 mt-0.5">by {entry.userEmail}</p>}
                  </div>
                  <p className="text-[10px] opacity-60 flex-shrink-0">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
