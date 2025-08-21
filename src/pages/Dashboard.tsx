
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useUpcomingServices } from '@/hooks/useServicesData';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: upcomingServices, isLoading: servicesLoading } = useUpcomingServices();

  if (statsLoading || servicesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Parts in Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalParts?.toLocaleString() || 0}</div>
            <p className="text-xs opacity-80">Current inventory count</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{stats?.monthlyRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs opacity-80">Sales + Services combined</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Services This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.servicesThisMonth || 0}</div>
            <p className="text-xs opacity-80">Completed services</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.lowStockAlerts || 0}</div>
            <p className="text-xs opacity-80">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.salesTrendData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Parts */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.topParts || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, sold }) => `${name}: ${sold}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sold"
                >
                  {(stats?.topParts || []).map((entry, index) => (
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
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Low Stock Alerts</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.lowStockItems?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Current: {item.current} units</p>
                  </div>
                  <Badge 
                    variant={item.urgency === 'high' ? 'destructive' : item.urgency === 'medium' ? 'default' : 'secondary'}
                  >
                    {item.urgency === 'high' ? 'Critical' : item.urgency === 'medium' ? 'Low' : 'Warning'}
                  </Badge>
                </div>
              )) || <p className="text-gray-500">No low stock items</p>}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Services</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/service-history')}>View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingServices?.slice(0, 4).map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{service.vehicles.customers.name}</p>
                    <p className="text-sm text-gray-600">{service.vehicles.make} {service.vehicles.model}</p>
                    <p className="text-xs text-gray-500">{service.service_types.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{service.next_service_date}</p>
                    <Badge variant="outline" className="text-xs">Due Soon</Badge>
                  </div>
                </div>
              )) || <p className="text-gray-500">No upcoming services</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2" onClick={() => navigate('/inventory')}>
              <span className="text-2xl">📦</span>
              <span>Manage Parts</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => navigate('/sales')}>
              <span className="text-2xl">💰</span>
              <span>Record Sale</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => navigate('/servicing')}>
              <span className="text-2xl">🔧</span>
              <span>New Service</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => navigate('/reports')}>
              <span className="text-2xl">📊</span>
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
