import { useEffect, useState } from 'react';
import { Shield, IndianRupee, Calendar } from 'lucide-react';
import { supabase, Policy } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function PolicyCard() {
  const { user } = useAuth();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPolicy();
    }
  }, [user]);

  const loadPolicy = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setPolicy(data);
    } catch (error) {
      console.error('Error loading policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const weeklyPremium = 150;
      const coverage = 50000;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const { error } = await supabase.from('policies').insert({
        user_id: user.id,
        weekly_premium: weeklyPremium,
        coverage_amount: coverage,
        status: 'active',
        end_date: endDate.toISOString(),
      });

      if (error) throw error;
      await loadPolicy();
    } catch (error) {
      console.error('Error creating policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md p-6 text-white">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-blue-400 rounded w-1/3"></div>
          <div className="h-8 bg-blue-400 rounded"></div>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md p-6 text-white">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">No Active Policy</h3>
          <p className="text-blue-100 mb-6 text-sm">
            Get protected with our parametric insurance coverage
          </p>
          <button
            onClick={createPolicy}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Activate Coverage
          </button>
        </div>
      </div>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(policy.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Active Policy</h3>
        </div>
        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
          {policy.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-blue-100 text-sm mb-1">Weekly Premium</p>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-6 h-6" />
            <p className="text-3xl font-bold">
              {policy.weekly_premium.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-blue-500">
          <p className="text-blue-100 text-sm mb-1">Coverage Amount</p>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            <p className="text-2xl font-bold">
              {policy.coverage_amount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-blue-500">
          <div className="flex items-center gap-2 text-blue-100">
            <Calendar className="w-4 h-4" />
            <p className="text-sm">
              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <p className="text-xs text-blue-200 mt-1">
            Renews on {new Date(policy.end_date).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-blue-500">
        <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm">
          View Details
        </button>
      </div>
    </div>
  );
}
