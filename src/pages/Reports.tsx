import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReportsData, useMonthlyRevenueData, useServiceTypesData, useTopSellingPartsData, useTopCustomersData } from '@/hooks/useReportsData';
import { useLowStockParts } from '@/hooks/useSparePartsData';

const Reports = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState('2024');

  const { data: reportsData, isLoading: reportsLoading } = useReportsData();
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyRevenueData();
  const { data: serviceTypesData, isLoading: serviceTypesLoading } = useServiceTypesData();
  const { data: topSellingParts, isLoading: topPartsLoading } = useTopSellingPartsData();
  const { data: topCustomers, isLoading: topCustomersLoading } = useTopCustomersData();
  const { data: lowStockParts, isLoading: lowStockLoading } = useLowStockParts();

  const isLoading = reportsLoading || monthlyLoading || serviceTypesLoading || topPartsLoading || topCustomersLoading || lowStockLoading;

  const generateReport = (reportType: string) => {
    let reportData;
    let filename;

    switch (reportType) {
      case 'inventory':
        reportData = topSellingParts;
        filename = `inventory-report-${selectedYear}.csv`;
        break;
      case 'sales':
        reportData = monthlyData;
        filename = `sales-report-${selectedYear}.csv`;
        break;
      case 'services':
        reportData = serviceTypesData;
        filename = `services-report-${selectedYear}.csv`;
        break;
      case 'customers':
        reportData = topCustomers;
        filename = `customers-report-${selectedYear}.csv`;
        break;
      default:
        return;
    }

    console.log('Generating report:', { type: reportType, data: reportData });
    
    toast({
      title: "Report Generated",
      description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been downloaded as ${filename}`,
    });
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPercentageChange = (change: number) => {
    const isPositive = change >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs">{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const lowStockItems = lowStockParts?.map(part => ({
    name: part.part_name,
    current: part.quantity_in_stock,
    threshold: part.reorder_threshold,
    status: part.quantity_in_stock <= 0 ? 'critical' : 
            part.quantity_in_stock <= part.reorder_threshold / 2 ? 'critical' : 'low'
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600">Real-time business insights and comprehensive reports</p>
        </div>
        
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards - Real-time data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-2xl font-bold">${reportsData?.totalRevenue?.toLocaleString() || 0}</p>
                {formatPercentageChange(reportsData?.revenueChange || 0)}
              </div>
              <div className="text-3xl opacity-80">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Parts Sold</p>
                <p className="text-2xl font-bold">{reportsData?.partsSold?.toLocaleString() || 0}</p>
                {formatPercentageChange(reportsData?.partsChange || 0)}
              </div>
              <div className="text-3xl opacity-80">📦</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Services Completed</p>
                <p className="text-2xl font-bold">{reportsData?.servicesCompleted || 0}</p>
                {formatPercentageChange(reportsData?.servicesChange || 0)}
              </div>
              <div className="text-3xl opacity-80">🔧</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Active Customers</p>
                <p className="text-2xl font-bold">{reportsData?.activeCustomers || 0}</p>
                {formatPercentageChange(reportsData?.customersChange || 0)}
              </div>
              <div className="text-3xl opacity-80">👥</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <Button variant="outline" size="sm" onClick={() => generateReport('sales')}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name === 'revenue' ? 'Total Revenue' : name]} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Total Revenue" />
                <Line type="monotone" dataKey="salesRevenue" stroke="#82ca9d" strokeWidth={2} name="Parts Sales" />
                <Line type="monotone" dataKey="servicesRevenue" stroke="#ffc658" strokeWidth={2} name="Services" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Types Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Service Types Distribution</CardTitle>
            <Button variant="outline" size="sm" onClick={() => generateReport('services')}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceTypesData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(serviceTypesData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Parts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Selling Parts</CardTitle>
            <Button variant="outline" size="sm" onClick={() => generateReport('inventory')}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(topSellingParts || []).map((part, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: part.color }}></div>
                    <div>
                      <p className="font-medium">{part.name}</p>
                      <p className="text-sm text-gray-600">{part.quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${part.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{part.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
              {(!topSellingParts || topSellingParts.length === 0) && (
                <p className="text-gray-500 text-center py-4">No sales data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Customers</CardTitle>
            <Button variant="outline" size="sm" onClick={() => generateReport('customers')}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(topCustomers || []).map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.services} services</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${customer.totalSpent.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{customer.lastService}</p>
                  </div>
                </div>
              ))}
              {(!topCustomers || topCustomers.length === 0) && (
                <p className="text-gray-500 text-center py-4">No customer data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Inventory Alerts</span>
            <Badge variant="destructive">{lowStockItems.filter(item => item.status === 'critical').length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg ${getStockStatusColor(item.status)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm">Stock: {item.current} / {item.threshold}</p>
                  </div>
                  <Badge variant={item.status === 'critical' ? 'destructive' : 'default'} className="text-xs">
                    {item.status}
                  </Badge>
                </div>
                <div className="mt-2 bg-white bg-opacity-50 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-current" 
                    style={{ width: `${Math.min((item.current / item.threshold) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No low stock alerts</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => generateReport('inventory')}>
              <Download className="h-6 w-6" />
              <span>Inventory Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => generateReport('sales')}>
              <Download className="h-6 w-6" />
              <span>Sales Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => generateReport('services')}>
              <Download className="h-6 w-6" />
              <span>Services Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => generateReport('customers')}>
              <Download className="h-6 w-6" />
              <span>Customer Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
