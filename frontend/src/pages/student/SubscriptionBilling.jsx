import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import TopNav from '../../components/common/TopNav';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, containerStagger, itemFadeUp } from '../../animations/presets';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function SubscriptionBilling() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isYearly, setIsYearly] = useState(false);

  // Fetch all plans
  const { data: plansData, isLoading: loadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await api.get('/saas/plans');
      return res.data?.data || [];
    }
  });

  // Fetch organization subscription details
  const { data: orgData, isLoading: loadingOrg } = useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const res = await api.get('/saas/organization');
      return res.data?.data || null;
    }
  });

  // Fetch invoices
  const { data: invoicesData, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/saas/invoices');
      return res.data?.data || [];
    }
  });

  // Mutation to upgrade plan
  const upgradePlanMutation = useMutation({
    mutationFn: async ({ planId, isYearly }) => {
      const res = await api.put(`/saas/organization/plan?planId=${planId}&isYearly=${isYearly}`);
      return res.data?.data;
    },
    onSuccess: async (data) => {
      toast.success('Subscription plan updated successfully!');
      // Refresh organization & invoice caches
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      
      // Update local auth store state with refreshed /auth/me info
      try {
        const profileRes = await api.get('/auth/me');
        const refreshedUser = profileRes.data?.data;
        if (refreshedUser) {
          useAuthStore.getState().setAuth(
            refreshedUser,
            localStorage.getItem('accessToken'),
            localStorage.getItem('refreshToken')
          );
        }
      } catch (err) {
        console.error('Failed to reload current user profile', err);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Plan upgrade failed. Please try again.');
    }
  });

  const handleUpgrade = (planId) => {
    upgradePlanMutation.mutate({ planId, isYearly });
  };

  const getPlanDetails = (planName) => {
    switch (planName?.toUpperCase()) {
      case 'FREE':
        return {
          color: 'from-slate-500 to-slate-700',
          features: ['5 Monthly Orders', 'Standard Writer Matching', 'Standard Email Support']
        };
      case 'PRO':
        return {
          color: 'from-indigo-500 to-indigo-700 shadow-indigo-500/20',
          features: ['25 Monthly Orders', 'Priority Writer Matching', 'Advanced Assignment Stepper', 'Priority Email Support']
        };
      case 'ENTERPRISE':
        return {
          color: 'from-violet-600 to-purple-800 shadow-purple-500/20',
          features: ['Unlimited Monthly Orders', 'Priority Matching Priority Queue', 'Advanced SaaS Admin Analytics', 'Dedicated 24/7 Coordinator', 'Direct STOMP WebSockets Channel']
        };
      default:
        return {
          color: 'from-zinc-500 to-zinc-700',
          features: ['Basic access']
        };
    }
  };

  const activePlanName = user?.planName || 'FREE';
  const orgName = orgData?.name || 'Personal Workspace';
  const subscriptionExpiresAt = orgData?.subscriptionExpiresAt;
  const subscriptionStatus = orgData?.subscriptionStatus || 'ACTIVE';

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 pb-10"
    >
      <TopNav title="Billing & Subscription" />

      {/* Active Subscription Summary */}
      <motion.div variants={itemFadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 flex flex-col justify-between glass relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-plasma/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-success rounded-full animate-ping"></span>
              <span className="text-xs font-mono text-success uppercase font-semibold tracking-wider">Active Workspace</span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-1">{orgName}</h3>
            <p className="text-sm text-secondary mb-4">Domain: {orgData?.domain || user?.email?.split('@')[1]}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border-primary pt-4 mt-4">
            <div>
              <span className="text-xs text-muted block mb-1">CURRENT PLAN</span>
              <span className="text-sm font-semibold text-primary uppercase bg-plasma/10 text-plasma px-2.5 py-1 rounded-md border border-plasma/20 inline-block">
                {activePlanName}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted block mb-1">RENEWAL / EXPIRATION</span>
              <span className="text-sm font-semibold text-primary">
                {subscriptionExpiresAt
                  ? new Date(subscriptionExpiresAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                  : 'Never'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between glass border-plasma/30 relative">
          <div className="absolute top-0 right-0 p-2 bg-plasma/10 border-l border-b border-plasma/20 text-plasma text-[10px] font-mono rounded-bl-lg font-bold">
            TIER STATUS
          </div>
          <div>
            <span className="text-xs text-muted block mb-1">BILLING CYCLE STATUS</span>
            <h4 className="text-2xl font-extrabold text-glow-plasma text-plasma mb-2">{subscriptionStatus}</h4>
            <p className="text-xs text-secondary leading-relaxed">
              Upgrade to PRO or Enterprise for increased task quotas and priority match speeds.
            </p>
          </div>
          <div className="mt-4">
            <span className="text-xs text-muted block mb-1">API TRANSACTION CHANNELS</span>
            <span className="text-[11px] font-mono text-secondary bg-elevated px-2 py-1 rounded border border-border-primary">
              REST / WebSockets STOMP Secured
            </span>
          </div>
        </Card>
      </motion.div>

      {/* Monthly vs Yearly Billing Switcher */}
      <motion.div variants={itemFadeUp} className="flex justify-center items-center gap-4 mt-8">
        <span className={clsx("text-sm transition-all", !isYearly ? "text-primary font-semibold" : "text-muted")}>Monthly</span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className="w-14 h-8 bg-elevated rounded-full p-1 border border-border-primary transition-all relative flex items-center"
        >
          <div
            className={clsx(
              "w-6 h-6 rounded-full bg-plasma shadow transition-all duration-300 transform",
              isYearly ? "translate-x-6 bg-indigo-500" : "translate-x-0"
            )}
          />
        </button>
        <span className={clsx("text-sm transition-all flex items-center gap-1.5", isYearly ? "text-primary font-semibold" : "text-muted")}>
          Yearly 
          <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded">
            Save 20%
          </span>
        </span>
      </motion.div>

      {/* Plan Catalogue Comparison Cards */}
      <motion.div
        variants={containerStagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {loadingPlans ? (
          <p className="text-muted text-center col-span-3 py-10 font-mono">Retrieving tier details...</p>
        ) : (
          plansData?.map((plan) => {
            const isCurrent = activePlanName.toUpperCase() === plan.name.toUpperCase();
            const config = getPlanDetails(plan.name);
            const price = isYearly ? plan.priceYearly : plan.priceMonthly;

            return (
              <motion.div
                key={plan.id}
                variants={itemFadeUp}
                className={clsx(
                  "rounded-2xl p-6 glass border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px]",
                  isCurrent ? "border-plasma/50 bg-plasma/5 shadow-glow" : "border-border-primary"
                )}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-plasma text-void text-[10px] font-bold px-3 py-1 rounded-bl-xl font-mono uppercase tracking-wider">
                    Current Plan
                  </div>
                )}
                
                <div>
                  <h4 className="text-lg font-bold text-primary mb-1 uppercase tracking-wider">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-3xl font-extrabold text-primary">₹{price}</span>
                    <span className="text-xs text-muted">/{isYearly ? 'year' : 'month'}</span>
                  </div>

                  <ul className="space-y-3 mt-6 border-t border-border-primary pt-6">
                    {config.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-secondary">
                        <span className="text-success select-none">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  {isCurrent ? (
                    <Button variant="ghost" disabled className="w-full">
                      Active Subscription
                    </Button>
                  ) : (
                    <Button
                      variant={plan.name.toUpperCase() === 'ENTERPRISE' ? 'orbit' : 'plasma'}
                      loading={upgradePlanMutation.isPending}
                      onClick={() => handleUpgrade(plan.id)}
                      className="w-full"
                    >
                      Subscribe {plan.name}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Invoice Billing History */}
      <motion.div variants={itemFadeUp} className="mt-12 space-y-4">
        <h3 className="text-lg font-bold text-primary tracking-wider uppercase">Billing History</h3>
        
        <Card className="glass overflow-hidden border-border-primary">
          {loadingInvoices ? (
            <p className="text-muted text-center py-6 font-mono text-xs">Loading transaction invoices...</p>
          ) : !invoicesData || invoicesData.length === 0 ? (
            <p className="text-muted text-center py-8 text-xs leading-relaxed font-mono">
              No invoice records logged. Upgrades will be listed here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-primary bg-elevated/40 text-muted uppercase font-mono tracking-wider font-semibold">
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Billing Period</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary font-mono text-secondary">
                  {invoicesData.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-semibold text-primary">#INV-{inv.id}</td>
                      <td className="p-4">₹{inv.amount}</td>
                      <td className="p-4">
                        {inv.billingPeriodStart ? new Date(inv.billingPeriodStart).toLocaleDateString('en-IN') : 'N/A'} -{' '}
                        {inv.billingPeriodEnd ? new Date(inv.billingPeriodEnd).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="p-4">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleString('en-IN', { dateStyle: 'medium' }) : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                            inv.status === 'PAID'
                              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          )}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
