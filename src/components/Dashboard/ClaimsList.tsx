import { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, IndianRupee } from 'lucide-react';
import { supabase, Claim } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function ClaimsList() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadClaims();
      const interval = setInterval(loadClaims, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadClaims = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('user_id', user.id)
        .order('triggered_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Claims History</h3>
        </div>
        <span className="text-sm text-gray-500">{claims.length} total</span>
      </div>

      {claims.length > 0 ? (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 capitalize">
                      {claim.trigger_type} Trigger
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(claim.status)}`}>
                      {getStatusIcon(claim.status)}
                      {claim.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Trigger Value: {claim.trigger_value}
                    {claim.trigger_type === 'rainfall' && 'mm'}
                    {claim.trigger_type === 'temperature' && '°C'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
                    <IndianRupee className="w-4 h-4" />
                    {claim.claim_amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>Triggered: {new Date(claim.triggered_at).toLocaleString('en-IN')}</span>
                {claim.processed_at && (
                  <span>Processed: {new Date(claim.processed_at).toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No claims yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Claims are automatically triggered by parametric events
          </p>
        </div>
      )}
    </div>
  );
}
