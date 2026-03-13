export default function PatientCard({ patient, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(patient)}
      className={`w-full text-left p-4 rounded-xl transition-all duration-300 border ${
        isSelected
          ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
          : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/60 hover:border-slate-600/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
        }`}>
          {patient.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{patient.name}</p>
          <p className="text-xs text-slate-400">ID: {patient.patient_id}</p>
        </div>
        {patient.age && (
          <span className="text-xs text-slate-500">Age {patient.age}</span>
        )}
      </div>
      {patient.medical_history && (
        <p className="mt-2 text-xs text-slate-400 truncate">📋 {patient.medical_history}</p>
      )}
    </button>
  );
}
