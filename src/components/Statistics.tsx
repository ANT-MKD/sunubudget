import React, { useMemo, useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, DollarSign, TrendingDown } from 'lucide-react';
import { useTransactions } from '../hooks/useStorage';
import type { Transaction } from '../types';

const getCategoryColor = (category: string): string => {
  const colors = {
    Alimentation: '#EF4444',
    Transport: '#3B82F6',
    Logement: '#8B5CF6',
    Loisirs: '#10B981',
    Santé: '#F59E0B',
    Vêtements: '#EC4899',
    Éducation: '#06B6D4',
    Technologie: '#6366F1',
    Assurance: '#84CC16',
    Impôts: '#F97316',
    Cadeaux: '#A855F7',
    Voyage: '#14B8A6',
  };
  return colors[category as keyof typeof colors] || '#6B7280';
};

const getCategoryIcon = (category: string): string => {
  const icons = {
    Alimentation: '🍽️',
    Transport: '🚗',
    Logement: '🏠',
    Loisirs: '🎮',
    Santé: '💊',
    Vêtements: '👕',
    Éducation: '📚',
    Technologie: '💻',
    Assurance: '🛡️',
    Impôts: '📄',
    Cadeaux: '🎁',
    Voyage: '✈️',
  };
  return icons[category as keyof typeof icons] || '💰';
};

function buildMonthlyData(transactions: Transaction[]) {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentYear = new Date().getFullYear();

  return months.map((month, index) => {
    const monthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === currentYear && transactionDate.getMonth() === index;
    });

    const income = monthTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return {
      month,
      income,
      expense,
      net: income - expense,
    };
  });
}

function buildCategoryData(transactions: Transaction[]) {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const categoryMap = new Map<string, number>();

  expenseTransactions.forEach((transaction) => {
    const current = categoryMap.get(transaction.category) || 0;
    categoryMap.set(transaction.category, current + transaction.amount);
  });

  const totalExpenses = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);

  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    color: getCategoryColor(category),
    icon: getCategoryIcon(category),
  }));
}

const Statistics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [hoveredAreaPoint, setHoveredAreaPoint] = useState<number | null>(null);

  const { transactions } = useTransactions();

  const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions]);
  const categoryExpenses = useMemo(() => buildCategoryData(transactions), [transactions]);

  // Calculer les statistiques globales
  const totalIncome = monthlyData.reduce((sum, data) => sum + data.income, 0);
  const totalExpense = monthlyData.reduce((sum, data) => sum + data.expense, 0);
  const totalNet = totalIncome - totalExpense;
  const averageIncome = monthlyData.length > 0 ? Math.round(totalIncome / monthlyData.length) : 0;
  const averageExpense = monthlyData.length > 0 ? Math.round(totalExpense / monthlyData.length) : 0;
  const savingsRate = totalIncome > 0 ? Math.round((totalNet / totalIncome) * 100) : 0;

  const pieSlices = useMemo(() => {
    const totalExpenses = categoryExpenses.reduce((sum, cat) => sum + cat.amount, 0);
    let currentAngle = 0;
    return categoryExpenses.map((cat, index) => {
      const angle = totalExpenses > 0 ? (cat.amount / totalExpenses) * 360 : 0;
      const slice = {
        ...cat,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        angle,
        index,
      };
      currentAngle += angle;
      return slice;
    });
  }, [categoryExpenses]);

  const totalExpenses = categoryExpenses.reduce((sum, cat) => sum + cat.amount, 0);

  // Interactive Bar Chart Component - Amélioré
  const InteractiveBarChart = () => {
    if (monthlyData.length === 0 || monthlyData.every(d => d.income === 0 && d.expense === 0)) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée</h3>
          <p className="text-gray-600">Ajoutez des transactions pour voir vos statistiques</p>
        </div>
      );
    }

    const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)));
    const chartHeight = 400;
    const chartWidth = 1000;
    const padding = 80;
    const availableWidth = chartWidth - (padding * 2);
    const availableHeight = chartHeight - (padding * 2);
    const barWidth = (availableWidth / monthlyData.length) * 0.8;
    const barSpacing = (availableWidth / monthlyData.length) * 0.2;

    const getX = (index: number) => {
      return padding + (index * (availableWidth / monthlyData.length)) + (barSpacing / 2);
    };

    return (
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Revenus</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Dépenses</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: {totalIncome.toLocaleString()} F CFA
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <svg 
            width={chartWidth} 
            height={chartHeight} 
            className="w-full h-auto"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            onMouseLeave={() => setHoveredAreaPoint(null)}
          >
            {/* Grille horizontale */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const y = padding + (i * availableHeight) / 5;
              const value = Math.round((maxValue * (5 - i)) / 5);
              return (
                <g key={i}>
                  <line 
                    x1={padding} 
                    y1={y} 
                    x2={chartWidth - padding} 
                    y2={y} 
                    stroke="#f3f4f6" 
                    strokeWidth="1"
                  />
                  <text 
                    x={padding - 15} 
                    y={y + 4} 
                    fontSize="14" 
                    fill="#9ca3af" 
                    textAnchor="end"
                  >
                    {value.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Barres pour chaque mois */}
            {monthlyData.map((data, index) => {
              const x = getX(index);
              const incomeHeight = availableHeight - (data.income / maxValue) * availableHeight;
              const expenseHeight = availableHeight - (data.expense / maxValue) * availableHeight;
              
              return (
                <g key={index}>
                  {/* Barre des revenus */}
                  <rect
                    x={x}
                    y={padding + incomeHeight}
                    width={barWidth / 2}
                    height={(data.income / maxValue) * availableHeight}
                    fill="#10b981"
                    className="cursor-pointer transition-all duration-200 hover:fill-green-600"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                    opacity={hoveredBar === index ? 0.8 : 0.7}
                  />
                  
                  {/* Barre des dépenses */}
                  <rect
                    x={x + barWidth / 2}
                    y={padding + expenseHeight}
                    width={barWidth / 2}
                    height={(data.expense / maxValue) * availableHeight}
                    fill="#ef4444"
                    className="cursor-pointer transition-all duration-200 hover:fill-red-600"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                    opacity={hoveredBar === index ? 0.8 : 0.7}
                  />

                  {/* Labels des mois */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - 15}
                    fontSize="14"
                    fill="#6b7280"
                    textAnchor="middle"
                    className={`transition-all ${hoveredBar === index ? 'font-bold fill-gray-900' : ''}`}
                  >
                    {data.month}
                  </text>

                  {/* Valeurs sur les barres - seulement au survol */}
                  {hoveredBar === index && (
                    <g>
                      {/* Valeur revenus */}
                      <text
                        x={x + barWidth / 4}
                        y={padding + incomeHeight - 8}
                        fontSize="12"
                        fill="#10b981"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {data.income.toLocaleString()}
                      </text>
                      
                      {/* Valeur dépenses */}
                      <text
                        x={x + (barWidth * 3) / 4}
                        y={padding + expenseHeight - 8}
                        fontSize="12"
                        fill="#ef4444"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {data.expense.toLocaleString()}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip - seulement au survol */}
          {hoveredBar !== null && (
            <div className="absolute bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10 text-xs min-w-48"
                 style={{
                   left: `${getX(hoveredBar) + barWidth / 2}px`,
                   top: `${padding + Math.min(
                     availableHeight - (monthlyData[hoveredBar].income / maxValue) * availableHeight,
                     availableHeight - (monthlyData[hoveredBar].expense / maxValue) * availableHeight
                   ) - 80}px`,
                   transform: 'translateX(-50%)'
                 }}>
              <div className="font-bold text-gray-900 mb-2">{monthlyData[hoveredBar].month}</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-600">Revenus:</span>
                  <span className="font-bold">{monthlyData[hoveredBar].income.toLocaleString()} F CFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Dépenses:</span>
                  <span className="font-bold">{monthlyData[hoveredBar].expense.toLocaleString()} F CFA</span>
                </div>
                <div className="border-t pt-1 mt-1">
                  <div className="flex justify-between">
                    <span className="font-bold">Solde net:</span>
                    <span className={`font-bold ${monthlyData[hoveredBar].net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {monthlyData[hoveredBar].net >= 0 ? '+' : ''}{monthlyData[hoveredBar].net.toLocaleString()} F CFA
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {monthlyData[hoveredBar].income > 0 ? Math.round((monthlyData[hoveredBar].net / monthlyData[hoveredBar].income) * 100) : 0}% d'épargne
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Interactive Area Chart Component - Amélioré
  const InteractiveAreaChart = () => {
    if (monthlyData.length === 0 || monthlyData.every(d => d.income === 0 && d.expense === 0)) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée</h3>
          <p className="text-gray-600">Ajoutez des transactions pour voir vos statistiques</p>
        </div>
      );
    }

    const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)));
    const chartHeight = 400;
    const chartWidth = 1000;
    const padding = 80;
    const availableWidth = chartWidth - (padding * 2);
    const availableHeight = chartHeight - (padding * 2);

    const getY = (value: number) => {
      return padding + availableHeight - (value / maxValue) * availableHeight;
    };

    const getX = (index: number) => {
      if (monthlyData.length <= 1) {
        return padding + availableWidth / 2;
      }
      return padding + (index / (monthlyData.length - 1)) * availableWidth;
    };

    const pointRadius = 6;
    const baselineY = getY(0);

    // Générer les points pour les lignes
    const incomePoints = monthlyData.map((data, index) => ({
      x: getX(index),
      y: getY(data.income),
      value: data.income,
      month: data.month
    }));

    const expensePoints = monthlyData.map((data, index) => ({
      x: getX(index),
      y: getY(data.expense),
      value: data.expense,
      month: data.month
    }));

    // Créer les chemins SVG pour les aires
    const createAreaPath = (points: typeof incomePoints) => {
      if (points.length < 2) return '';
      const first = points[0];
      const last = points[points.length - 1];

      const pathCommands = [
        `M ${first.x} ${baselineY}`,
        `L ${first.x} ${first.y}`,
        ...points.slice(1).map((point) => `L ${point.x} ${point.y}`),
        `L ${last.x} ${baselineY}`,
        'Z'
      ];

      return pathCommands.join(' ');
    };

    return (
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Revenus</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Dépenses</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <svg 
            width={chartWidth} 
            height={chartHeight} 
            className="w-full h-auto"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* Grille horizontale */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const y = padding + (i * availableHeight) / 5;
              const value = Math.round((maxValue * (5 - i)) / 5);
              return (
                <g key={i}>
                  <line 
                    x1={padding} 
                    y1={y} 
                    x2={chartWidth - padding} 
                    y2={y} 
                    stroke="#f3f4f6" 
                    strokeWidth="1"
                  />
                  <text 
                    x={padding - 15} 
                    y={y + 4} 
                    fontSize="14" 
                    fill="#9ca3af" 
                    textAnchor="end"
                  >
                    {value.toLocaleString()}
                  </text>
                </g>
              );
            })}
            <defs>
              <linearGradient id="incomeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="expenseAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Aire des revenus */}
            <path
              d={createAreaPath(incomePoints)}
              fill="url(#incomeAreaGradient)"
              stroke="#10b981"
              strokeWidth="2"
              className="transition-all duration-300"
            />

            {/* Aire des dépenses */}
            <path
              d={createAreaPath(expensePoints)}
              fill="url(#expenseAreaGradient)"
              stroke="#ef4444"
              strokeWidth="2"
              className="transition-all duration-300"
            />

            {/* Points et interactions pour les revenus */}
            {incomePoints.map((point, index) => (
              <g key={`income-${index}`}>
                {/* Zone invisible pour améliorer la détection du survol */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="15"
                  fill="transparent"
                  onMouseEnter={() => setHoveredAreaPoint(index)}
                  onMouseLeave={() => setHoveredAreaPoint(null)}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={pointRadius}
                  fill="#10b981"
                  className="cursor-pointer transition-all duration-200 hover:r-8"
                />
                {hoveredAreaPoint === index && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="12"
                    fill="#10b981"
                    opacity="0.3"
                    className="animate-pulse"
                  />
                )}
              </g>
            ))}

            {/* Points et interactions pour les dépenses */}
            {expensePoints.map((point, index) => (
              <g key={`expense-${index}`}>
                {/* Zone invisible pour améliorer la détection du survol */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="15"
                  fill="transparent"
                  onMouseEnter={() => setHoveredAreaPoint(index)}
                  onMouseLeave={() => setHoveredAreaPoint(null)}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={pointRadius}
                  fill="#ef4444"
                  className="cursor-pointer transition-all duration-200 hover:r-8"
                />
                {hoveredAreaPoint === index && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="12"
                    fill="#ef4444"
                    opacity="0.3"
                    className="animate-pulse"
                  />
                )}
              </g>
            ))}

            {/* Labels des mois */}
            {monthlyData.map((data, index) => (
              <text
                key={`label-${index}`}
                x={getX(index)}
                y={chartHeight - 15}
                fontSize="14"
                fill="#6b7280"
                textAnchor="middle"
                className={`transition-all ${hoveredAreaPoint === index ? 'font-bold fill-gray-900' : ''}`}
              >
                {data.month}
              </text>
            ))}
          </svg>

          {/* Tooltip - seulement au survol */}
          {hoveredAreaPoint !== null && (
            <div className="absolute bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10 text-xs min-w-48 pointer-events-none"
                 style={{
                   left: `${getX(hoveredAreaPoint)}px`,
                   top: `${getY(Math.max(monthlyData[hoveredAreaPoint].income, monthlyData[hoveredAreaPoint].expense)) - 60}px`,
                   transform: 'translateX(-50%)'
                 }}>
              <div className="font-bold text-gray-900 mb-2">{monthlyData[hoveredAreaPoint].month}</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-600">Revenus:</span>
                  <span className="font-bold">{monthlyData[hoveredAreaPoint].income.toLocaleString()} F CFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Dépenses:</span>
                  <span className="font-bold">{monthlyData[hoveredAreaPoint].expense.toLocaleString()} F CFA</span>
                </div>
                <div className="border-t pt-1 mt-1">
                  <div className="flex justify-between">
                    <span className="font-bold">Solde net:</span>
                    <span className={`font-bold ${monthlyData[hoveredAreaPoint].net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {monthlyData[hoveredAreaPoint].net >= 0 ? '+' : ''}{monthlyData[hoveredAreaPoint].net.toLocaleString()} F CFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Interactive Pie Chart Component - Amélioré
  const InteractivePieChart = () => {
    if (categoryExpenses.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée</h3>
          <p className="text-gray-600">Ajoutez des transactions pour voir la répartition</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {pieSlices.map((slice, index) => {
              const radius = 40;
              const centerX = 50;
              const centerY = 50;
              
              const startAngleRad = (slice.startAngle * Math.PI) / 180;
              const endAngleRad = (slice.endAngle * Math.PI) / 180;
              
              const x1 = centerX + radius * Math.cos(startAngleRad);
              const y1 = centerY + radius * Math.sin(startAngleRad);
              const x2 = centerX + radius * Math.cos(endAngleRad);
              const y2 = centerY + radius * Math.sin(endAngleRad);
              
              const largeArcFlag = slice.angle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={slice.color}
                  opacity={hoveredSlice === index ? 0.9 : 0.7}
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    transform: hoveredSlice === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: '50% 50%'
                  }}
                  onMouseEnter={() => setHoveredSlice(index)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{totalExpenses.toLocaleString()}</div>
              <div className="text-xs text-gray-500">F CFA</div>
              <div className="text-xs text-gray-400">Total dépenses</div>
            </div>
          </div>
          {hoveredSlice !== null && (
            <div className="absolute top-0 left-0 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-10 text-xs pointer-events-none">
              <div className="font-bold">{pieSlices[hoveredSlice].category}</div>
              <div>{pieSlices[hoveredSlice].amount.toLocaleString()} F CFA</div>
              <div>{pieSlices[hoveredSlice].percentage}%</div>
            </div>
          )}
        </div>
        
        <div className="space-y-3 flex-1 max-w-xs">
          {categoryExpenses.map((category, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                hoveredSlice === index ? 'bg-gray-100 shadow-md scale-105' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setHoveredSlice(index)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full transition-all"
                  style={{ 
                    backgroundColor: category.color,
                    transform: hoveredSlice === index ? 'scale(1.2)' : 'scale(1)'
                  }}
                ></div>
                <span className={`font-medium text-gray-900 text-sm transition-all ${
                  hoveredSlice === index ? 'font-bold' : ''
                }`}>
                  {category.category}
                </span>
              </div>
              <div className="text-right">
                <div className={`font-bold text-gray-900 text-sm transition-all ${
                  hoveredSlice === index ? 'text-lg' : ''
                }`}>
                  {category.amount.toLocaleString()} F CFA
                </div>
                <div className="text-xs text-gray-500">{category.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Statistiques</h1>
            <p className="text-gray-600">Analysez vos habitudes financières en détail</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
            <button className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Revenus Moyens</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{averageIncome.toLocaleString()} F CFA</div>
          <div className="text-sm text-green-600 mt-1">+0% vs mois dernier</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Dépenses Moyennes</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{averageExpense.toLocaleString()} F CFA</div>
          <div className="text-sm text-red-600 mt-1">+0% vs mois dernier</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Taux d'Épargne</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{savingsRate}%</div>
          <div className="text-sm text-blue-600 mt-1">Objectif: 30%</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Solde Net</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600">{totalNet.toLocaleString()} F CFA</div>
          <div className="text-sm text-purple-600 mt-1">Cette année</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenus vs Dépenses</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'bar' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Barres
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'area' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Aires
              </button>
            </div>
          </div>
          
          {chartType === 'bar' ? <InteractiveBarChart /> : <InteractiveAreaChart />}
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Répartition par Catégorie</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Voir détails
            </button>
          </div>
          
          <InteractivePieChart />
        </div>
      </div>

      {/* Savings Trend */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Évolution de l'Épargne</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Épargné</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>Objectif</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {monthlyData.length === 0 || monthlyData.every(d => d.net === 0) ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune donnée d'épargne disponible</p>
            </div>
          ) : (
            monthlyData.filter(data => data.net !== 0).map((data, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Épargné: {data.net.toLocaleString()} F CFA</span>
                    <span>Revenus: {data.income.toLocaleString()} F CFA</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${data.income > 0 ? Math.min((data.net / data.income) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                    {data.net > 0 && (
                      <div className="absolute right-0 top-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full transform translate-x-2 -translate-y-1">
                        Épargne positive!
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.income > 0 ? Math.round((data.net / data.income) * 100) : 0}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;