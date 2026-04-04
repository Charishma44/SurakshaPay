import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase, RiskAssessment as RiskAssessmentType } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function RiskAssessment() {
  const { user } = useAuth();
  const [risk, setRisk] = useState<RiskAssessmentType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRiskAssessment();
      const interval = setInterval(loadRiskAssessment, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadRiskAssessment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setRisk(data);
    } catch (error) {
      console.error('Error loading risk assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Risk Assessment</h3>
      </div>

      {risk ? (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${getRiskColor(risk.risk_level)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide">Risk Level</p>
                <p className="text-2xl font-bold capitalize mt-1">{risk.risk_level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Risk Score</p>
                <p className="text-3xl font-bold">{risk.risk_score}/100</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Location</p>
              <p className="font-medium text-sm text-gray-900">{risk.location}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Assessed At</p>
              <p className="font-medium text-sm text-gray-900">
                {new Date(risk.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Risk Factors</p>
            <div className="space-y-2">
              {Object.entries(risk.factors).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                  <span className="font-medium text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            {risk.risk_level === 'high' ? (
              <TrendingUp className="w-4 h-4 text-red-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-600" />
            )}
            <span>Updated every 30 seconds</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No risk assessment available yet</p>
          <button
            onClick={loadRiskAssessment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Assessment
          </button>
        </div>
      )}
    </div>
  );
}
