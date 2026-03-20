import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function BundleSuggestions() {
  const [expiryItems, setExpiryItems] = useState([]);
  const [deadStock, setDeadStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [expiryRes, deadRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/near_expiry?days=30', { headers }),
          axios.get('http://127.0.0.1:5000/dead_stock?months_back=3', { headers }),
        ]);

        setExpiryItems(Array.isArray(expiryRes.data) ? expiryRes.data : []);
        setDeadStock(Array.isArray(deadRes.data) ? deadRes.data : []);
      } catch (err) {
        console.error('Bundle fetch failed:', err);
        setExpiryItems([]);
        setDeadStock([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  const bundleSuggestions = useMemo(() => {
    const normalizeBundleArrays = (item, sourceLabel) => {
      const raw =
        item.bundles ||
        item.bundle_suggestions ||
        item.bundle_recommendations ||
        item.suggested_bundles ||
        [];
      if (!Array.isArray(raw)) return [];
      return raw.map((bundle, idx) => ({
        id: bundle.bundle_id || bundle.id || `${sourceLabel}_${item.item_id || item.id || idx}`,
        title: bundle.name || bundle.bundle_name || bundle.title || item.product_name || item.item_name || 'Bundle',
        items: bundle.items || bundle.products || bundle.bundle_items || bundle.items_list || [],
        discount: bundle.discount || bundle.discount_pct || bundle.discount_percent || bundle.discount_rate,
        reason: bundle.reason || bundle.strategy || bundle.match_type || bundle.source,
        source: sourceLabel,
      }));
    };

    const normalizeBundleWith = (item, sourceLabel) => {
      const bundleWith = item.bundle_with || item.bundleWith || [];
      if (!Array.isArray(bundleWith) || bundleWith.length === 0) return [];
      const primary = item.product_name || item.item_name || item.name || 'Item';
      return [{
        id: `${sourceLabel}_${item.item_id || item.id || primary}`,
        title: `Bundle: ${primary}`,
        items: [primary, ...bundleWith],
        discount: item.recommended_discount || item.discount,
        reason: item.bundling_suggestion || item.recommendation,
        source: sourceLabel,
      }];
    };

    const collect = (list, sourceLabel) => {
      if (!Array.isArray(list)) return [];
      return list.flatMap((item) => ([
        ...normalizeBundleArrays(item, sourceLabel),
        ...normalizeBundleWith(item, sourceLabel),
      ]));
    };

    const suggestions = [
      ...collect(expiryItems, 'Near Expiry'),
      ...collect(deadStock, 'Dead Stock'),
    ];

    const deduped = [];
    const seen = new Set();
    suggestions.forEach((s) => {
      const key = `${s.title}-${Array.isArray(s.items) ? s.items.join('|') : ''}-${s.discount || ''}-${s.source}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(s);
      }
    });

    return deduped;
  }, [expiryItems, deadStock]);

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-stockly-900">Bundle Suggestions</h1>
        <p className="text-sm text-gray-600">
          AI-assisted pairings from near-expiry and dead-stock items to improve sell-through.
        </p>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-sm text-gray-500">Loading bundle suggestions...</div>
        ) : bundleSuggestions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {bundleSuggestions.map((bundle) => {
              const items = Array.isArray(bundle.items) ? bundle.items : [];
              const labels = items.map((i) => {
                if (typeof i === 'string') return i;
                return i?.name || i?.item_name || i?.product_name || 'Item';
              });
              const visible = labels.slice(0, 4);
              const extra = labels.length - visible.length;

              return (
                <div key={bundle.id} className="rounded-2xl border border-stockly-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{bundle.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{bundle.source}</p>
                    </div>
                    {bundle.discount && (
                      <span className="shrink-0 rounded-full bg-stockly-50 px-2 py-1 text-xs font-semibold text-stockly-700">
                        {bundle.discount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {visible.map((label, idx) => (
                      <span key={`${bundle.id}_item_${idx}`} className="rounded-lg bg-stockly-50 px-2.5 py-1 text-xs font-medium text-stockly-800">
                        {label}
                      </span>
                    ))}
                    {extra > 0 && (
                      <span className="rounded-lg bg-stockly-100 px-2.5 py-1 text-xs font-medium text-stockly-800">
                        +{extra} more
                      </span>
                    )}
                  </div>

                  {bundle.reason && (
                    <p className="mt-3 text-xs text-gray-600">
                      Strategy: <span className="font-medium">{bundle.reason}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No bundle suggestions available yet.</div>
        )}
      </div>
    </div>
  );
}

