export default function BlockchainStatus({ txData, loading, onStore }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span className="text-lg">⛓️</span> Blockchain Audit
      </h3>

      {!txData && (
        <button
          onClick={onStore}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white
            hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98] transition-all duration-300
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Storing on-chain...
            </span>
          ) : '🔐 Store on Blockchain'}
        </button>
      )}

      {txData && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-400">✅</span>
            <span className="text-xs text-emerald-300 font-medium">Record stored on Polygon Amoy</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <p className="text-slate-500">Record Hash</p>
              <p className="text-slate-300 font-mono break-all">{txData.record_hash}</p>
            </div>
            <div>
              <p className="text-slate-500">Transaction Hash</p>
              <p className="text-slate-300 font-mono break-all">{txData.transaction_hash}</p>
            </div>
            {txData.block_number && (
              <div>
                <p className="text-slate-500">Block Number</p>
                <p className="text-slate-300">{txData.block_number}</p>
              </div>
            )}
          </div>

          {txData.polygonscan_url && (
            <a
              href={txData.polygonscan_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs hover:bg-indigo-500/20 transition-all"
            >
              🔍 View on PolygonScan →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
