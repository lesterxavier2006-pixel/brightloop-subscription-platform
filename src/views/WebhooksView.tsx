import React, { useState } from 'react';
import { Webhook, CheckCircle2, Clock, Code, Copy, RefreshCw, Send } from 'lucide-react';

interface WebhookEvent {
  id: string;
  type: string;
  status: 200 | 400 | 500;
  latencyMs: number;
  timestamp: string;
  source: 'Stripe' | 'Razorpay' | 'ACH' | 'Internal';
  payload: any;
}

export const WebhooksView: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('evt_01');
  const [copied, setCopied] = useState(false);

  const events: WebhookEvent[] = [
    {
      id: 'evt_01',
      type: 'invoice.payment_succeeded',
      status: 200,
      latencyMs: 42,
      timestamp: '2026-10-31 09:14:02 UTC',
      source: 'Stripe',
      payload: {
        id: 'evt_1Qx8942A',
        object: 'event',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_9921',
            customer: 'cus_8941_linear',
            amount_paid: 89000,
            currency: 'usd',
            status: 'paid',
            attempt_count: 1,
            payment_intent: 'pi_3Pq9812A',
          },
        },
      },
    },
    {
      id: 'evt_02',
      type: 'customer.subscription.updated',
      status: 200,
      latencyMs: 38,
      timestamp: '2026-10-31 08:30:19 UTC',
      source: 'Internal',
      payload: {
        id: 'evt_1Qx8943B',
        object: 'event',
        type: 'customer.subscription.updated',
        data: {
          previous_attributes: { seats: 12 },
          object: {
            id: 'sub_9821_x',
            seats: 18,
            mrr_delta_usd: 240,
            plan: 'plan_growth',
          },
        },
      },
    },
    {
      id: 'evt_03',
      type: 'invoice.payment_failed',
      status: 200,
      latencyMs: 51,
      timestamp: '2026-10-31 06:12:44 UTC',
      source: 'Stripe',
      payload: {
        id: 'evt_1Qx8944C',
        object: 'event',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_9922',
            customer: 'cus_7721_retool',
            amount_due: 89000,
            decline_code: 'expired_card',
            dunning_phase: 2,
            next_retry_at: 1793400000,
          },
        },
      },
    },
    {
      id: 'evt_04',
      type: 'mandate.autopay.settled',
      status: 200,
      latencyMs: 64,
      timestamp: '2026-10-30 22:40:11 UTC',
      source: 'Razorpay',
      payload: {
        id: 'evt_rzp_991',
        event: 'mandate.autopay.settled',
        account: 'dataship@icici',
        amount_inr: 20457500,
        status: 'authorized',
      },
    },
  ];

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedEvent.payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0F172A] tracking-[-0.02em] font-display">
          Webhooks & Developer Event Stream
        </h1>
        <p className="text-[13px] text-[#64748B] mt-0.5">
          Real-time payment gateway ingress telemetry, delivery logs, and verified payload inspector.
        </p>
      </div>

      {/* Webhook Endpoint Summary */}
      <div className="p-4 bg-white border border-[#E2E8F0] rounded-[8px] pm-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-[#EEF2FF] text-[#3457D5] flex items-center justify-center">
            <Webhook size={16} />
          </div>
          <div>
            <div className="text-[13px] font-bold text-[#0F172A] font-mono-numbers">
              https://api.precisionmetric.internal/v1/webhooks/ingress
            </div>
            <div className="text-[11px] text-[#64748B]">
              Signing Secret: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">whsec_live_9941a8...</code> · 4 Active Subscriptions
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#16A34A] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#BBF7D0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          Listening (200 OK)
        </span>
      </div>

      {/* Event Stream Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Events List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden pm-shadow-sm">
          <div className="px-4 py-3 border-b border-[#E2E8F0] text-[12px] font-semibold text-[#64748B] uppercase tracking-wider bg-[#F8FAFC]">
            Recent Inbound Events
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {events.map((evt) => {
              const isSelected = evt.id === selectedEventId;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#EEF2FF]/60 border-l-2 border-[#3457D5]' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono">
                      {evt.status} OK
                    </span>
                    <span className="text-[11px] text-[#94A3B8] font-mono-numbers">
                      {evt.latencyMs}ms
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold text-[#0F172A] mt-1 truncate font-mono">
                    {evt.type}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 flex items-center justify-between">
                    <span>Source: {evt.source}</span>
                    <span className="font-mono-numbers">{evt.timestamp.split(' ')[1]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Payload Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden pm-shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <div className="text-[13px] font-bold text-[#0F172A] font-mono">
              {selectedEvent.type}
            </div>
            <button
              onClick={copyPayload}
              className="px-2.5 py-1 text-[11px] font-medium text-[#64748B] hover:text-[#0F172A] bg-white border border-[#E2E8F0] rounded flex items-center gap-1"
            >
              <Copy size={12} />
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>

          <div className="p-4 flex-1 bg-[#0F172A] text-slate-100 font-mono text-[12px] overflow-x-auto leading-relaxed">
            <pre>{JSON.stringify(selectedEvent.payload, null, 2)}</pre>
          </div>

          <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] text-[11px] text-[#64748B] flex justify-between">
            <span>Timestamp: {selectedEvent.timestamp}</span>
            <span>Signature Verified (SHA-256)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
