"use client";
import React from 'react'
import { ArrowRight, Check } from 'lucide-react';

import { api } from '@/trpc/react';
import Header from '../_components/header'
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const { data: prices } = api.stripe.getPrices.useQuery();
  const { data: products } = api.stripe.getProducts.useQuery();

  const basePlan = products?.find((product) => product.name === 'Base');
  const plusPlan = products?.find((product) => product.name === 'Plus');

  const basePrice = prices?.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices?.find((price) => price.productId === plusPlan?.id);

  return (
    <main className="min-h-screen bg-neutral-900">
      <Header />
      <div className="grid md:grid-cols-2 gap-8 max-w-xl mx-auto">
        <PricingCard
          name={basePlan?.name ?? 'Base'}
          price={basePrice?.unitAmount ?? 800}
          interval={basePrice?.interval ?? 'month'}
          trialDays={basePrice?.trialPeriodDays ?? 7}
          features={[
            'Unlimited Usage',
            'Unlimited Workspace Members',
            'Email Support',
          ]}
          priceId={basePrice?.id}
        />
        <PricingCard
          name={plusPlan?.name ?? 'Plus'}
          price={plusPrice?.unitAmount ?? 1200}
          interval={plusPrice?.interval ?? 'month'}
          trialDays={plusPrice?.trialPeriodDays ?? 7}
          features={[
            'Everything in Base, and:',
            'Early Access to New Features',
            '24/7 Support + Slack Access',
          ]}
          priceId={plusPrice?.id}
        />
      </div>
    </main>
  )
}

function PricingCard({ name, price, interval, trialDays, features, priceId }: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
}) {
  const { mutateAsync, isPending } = api.stripe.createCheckoutSession.useMutation();

  const handleCheckout = async (input: { priceId: string }) => {
    try {
      const url = await mutateAsync(input);
      if (url.checkoutUrl) {
        window.open(url.checkoutUrl);
      } else {
        console.error('Error creating checkout session');
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="pt-6">
      <h2 className="text-2xl font-medium text-neutral-200 mb-2">{name}</h2>
      <p className="text-sm text-gray-400 mb-4">
        with {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        ${price / 100}{' '}
        <span className="text-xl font-normal text-gray-300">
          per user / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-center">
        <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white border border-gray-600 rounded-full flex items-center justify-center"
          onClick={() => handleCheckout({ priceId: priceId ?? '' })} disabled={isPending}>
          {isPending ? "Subscribing..." : "Subscribe"}

          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
