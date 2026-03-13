const riskConfig = {
  LOW: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: '✅', label: 'LOW RISK', anim: '' },
  MEDIUM: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: '⚠️', label: 'MEDIUM RISK', anim: '' },
  HIGH: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', icon: '🔶', label: 'HIGH RISK', anim: 'risk-high' },
  CRITICAL: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', icon: '🚨', label: 'CRITICAL', anim: 'risk-critical' },
};

export default function RiskAlert({ assessment }) {
  if (!assessment) return null;

  const cfg = riskConfig[assessment.risk_level] || riskConfig.LOW;

  return (
    <div className={`glass-card p-5 border ${cfg.border} ${cfg.anim}`}>
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${cfg.bg} ${cfg.text} font-bold text-sm mb-4`}>
        <span className="text-lg">{cfg.icon}</span>
        {cfg.label}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Assessment</p>
          <p className="text-sm text-slate-200 leading-relaxed">{assessment.reason}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Recommended Action</p>
          <p className={`text-sm font-medium ${cfg.text} leading-relaxed`}>{assessment.recommended_action}</p>
        </div>

        {assessment.vitals_flagged?.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Flagged Vitals</p>
            <div className="flex flex-wrap gap-2">
              {assessment.vitals_flagged.map((v) => (
                <span key={v} className={`px-2.5 py-1 rounded-md text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                  {v.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/30">
          <div className={`w-2 h-2 rounded-full ${assessment.alert_required ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></div>
          <span className="text-xs text-slate-400">
            {assessment.alert_required ? 'Alert sent to medical staff' : 'No alert required'}
          </span>
        </div>
      </div>
    </div>
  );
}
