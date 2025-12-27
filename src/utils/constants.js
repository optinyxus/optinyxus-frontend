import { TrendingUp, DollarSign, Zap, BarChart3 } from 'lucide-react';

export const PRODUCTS = [
  {
    id: 'marketedge',
    name: 'MarketEdge',
    description: 'Market intelligence and competitive analysis platform for strategic decisions',
    path: '/dashboard/marketedge',
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    solutions: [
      { name: 'Competitor Analysis', purpose: 'Track and analyze competitor strategies' },
      { name: 'Market Segmentation', purpose: 'Identify and target key market segments' },
      { name: 'Trend Forecasting', purpose: 'Predict market trends and opportunities' }
    ]
  },
  {
    id: 'pricegenix',
    name: 'PriceGenix AI',
    description: 'AI-powered price optimization engine for maximizing revenue and profitability',
    path: '/dashboard/pricegenix',
    icon: DollarSign,
    color: 'from-green-500 to-green-600',
    solutions: [
      { name: 'Dynamic Pricing', purpose: 'Real-time price adjustments based on demand' },
      { name: 'Profit Optimization', purpose: 'Maximize margins while staying competitive' },
      { name: 'Elasticity Analysis', purpose: 'Understand price-demand relationships' }
    ]
  },
  {
    id: 'engagesync',
    name: 'EngageSync',
    description: 'Customer engagement and synchronization platform for better relationships',
    path: '/dashboard/engagesync',
    icon: Zap,
    color: 'from-purple-500 to-purple-600',
    solutions: [
      { name: 'Multi-Channel Campaigns', purpose: 'Unified messaging across platforms' },
      { name: 'Customer Segmentation', purpose: 'Target the right audience with precision' },
      { name: 'Engagement Analytics', purpose: 'Track and optimize customer interactions' }
    ]
  },
  {
    id: 'optiflow',
    name: 'OptiFlow',
    description: 'Workflow optimization and process automation for operational excellence',
    path: '/dashboard/optiflow',
    icon: BarChart3,
    color: 'from-orange-500 to-orange-600',
    solutions: [
      { name: 'Process Automation', purpose: 'Streamline repetitive tasks' },
      { name: 'Resource Optimization', purpose: 'Efficient allocation of resources' },
      { name: 'Bottleneck Detection', purpose: 'Identify and resolve workflow issues' }
    ]
  },
];
