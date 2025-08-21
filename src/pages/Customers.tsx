
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, User, Car, Loader2 } from 'lucide-react';
import { useCustomersData } from '@/hooks/useServicesData';
import { useSalesData } from '@/hooks/useSalesData';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: customers, isLoading: customersLoading } = useCustomersData();
  const { data: sales, isLoading: salesLoading } = useSalesData();

  const allCustomers = useMemo(() => {
    const serviceCustomers = customers?.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      source: 'service' as const,
      vehicles: customer.vehicles,
      totalSpent: 0, // Will be calculated from services
      lastActivity: customer.created_at,
    })) || [];

    const salesCustomers = sales?.map(sale => ({
      id: sale.id,
      name: sale.customer_name,
      email: null,
      phone: null,
      address: null,
      source: 'sales' as const,
      vehicles: [],
      totalSpent: Number(sale.total_amount),
      lastActivity: sale.sale_date,
    })) || [];

    // Merge customers by name and combine their data
    const mergedCustomers = new Map();
    
    [...serviceCustomers, ...salesCustomers].forEach(customer => {
      const key = customer.name.toLowerCase();
      if (mergedCustomers.has(key)) {
        const existing = mergedCustomers.get(key);
        mergedCustomers.set(key, {
          ...existing,
          email: existing.email || customer.email,
          phone: existing.phone || customer.phone,
          address: existing.address || customer.address,
          vehicles: [...(existing.vehicles || []), ...(customer.vehicles || [])],
          totalSpent: existing.totalSpent + customer.totalSpent,
          source: existing.source === 'service' || customer.source === 'service' ? 'service' : 'sales',
          lastActivity: new Date(existing.lastActivity) > new Date(customer.lastActivity) 
            ? existing.lastActivity 
            : customer.lastActivity,
        });
      } else {
        mergedCustomers.set(key, customer);
      }
    });

    return Array.from(mergedCustomers.values());
  }, [customers, sales]);

  const filteredCustomers = allCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  if (customersLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-gray-600">View and manage all customers from sales and services</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              Across sales and services
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Customers</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allCustomers.filter(c => c.source === 'service').length}
            </div>
            <p className="text-xs text-muted-foreground">
              With registered vehicles
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground">₹</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{allCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From all customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer, index) => (
                <TableRow key={`${customer.name}-${index}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      {customer.address && (
                        <p className="text-sm text-gray-600">{customer.address}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.email && (
                        <p className="text-sm">{customer.email}</p>
                      )}
                      {customer.phone && (
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.source === 'service' ? 'default' : 'secondary'}>
                      {customer.source === 'service' ? 'Service' : 'Sales'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.vehicles && customer.vehicles.length > 0 ? (
                      <div className="space-y-1">
                        {customer.vehicles.map((vehicle: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            {vehicle.make} {vehicle.model} ({vehicle.registration_number})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No vehicles</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{customer.totalSpent.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.lastActivity).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
