
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReportsData = () => {
  return useQuery({
    queryKey: ['reports_data'],
    queryFn: async () => {
      // Get current month and last month dates
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch sales data for current month
      const { data: currentSales } = await supabase
        .from('sales')
        .select('total_amount, sale_date')
        .gte('sale_date', currentMonthStart.toISOString().split('T')[0]);

      // Fetch sales data for last month
      const { data: lastMonthSales } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('sale_date', lastMonthStart.toISOString().split('T')[0])
        .lte('sale_date', lastMonthEnd.toISOString().split('T')[0]);

      // Fetch services data for current month
      const { data: currentServices } = await supabase
        .from('services')
        .select('total_cost, service_date, service_type_id, service_types(name)')
        .gte('service_date', currentMonthStart.toISOString().split('T')[0]);

      // Fetch services data for last month
      const { data: lastMonthServices } = await supabase
        .from('services')
        .select('total_cost')
        .gte('service_date', lastMonthStart.toISOString().split('T')[0])
        .lte('service_date', lastMonthEnd.toISOString().split('T')[0]);

      // Calculate totals
      const currentSalesTotal = currentSales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const lastMonthSalesTotal = lastMonthSales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const currentServicesTotal = currentServices?.reduce((sum, service) => sum + Number(service.total_cost), 0) || 0;
      const lastMonthServicesTotal = lastMonthServices?.reduce((sum, service) => sum + Number(service.total_cost), 0) || 0;

      const currentRevenue = currentSalesTotal + currentServicesTotal;
      const lastMonthRevenue = lastMonthSalesTotal + lastMonthServicesTotal;

      // Fetch parts sold data
      const { data: saleItems } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          spare_parts(part_name),
          sales(sale_date)
        `)
        .gte('sales.sale_date', currentMonthStart.toISOString().split('T')[0]);

      const { data: serviceParts } = await supabase
        .from('service_parts')
        .select(`
          quantity,
          spare_parts(part_name),
          services(service_date)
        `)
        .gte('services.service_date', currentMonthStart.toISOString().split('T')[0]);

      const currentPartsSold = (saleItems?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0) +
                              (serviceParts?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0);

      // Get last month parts sold for comparison
      const { data: lastMonthSaleItems } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          sales(sale_date)
        `)
        .gte('sales.sale_date', lastMonthStart.toISOString().split('T')[0])
        .lte('sales.sale_date', lastMonthEnd.toISOString().split('T')[0]);

      const { data: lastMonthServiceParts } = await supabase
        .from('service_parts')
        .select(`
          quantity,
          services(service_date)
        `)
        .gte('services.service_date', lastMonthStart.toISOString().split('T')[0])
        .lte('services.service_date', lastMonthEnd.toISOString().split('T')[0]);

      const lastMonthPartsSold = (lastMonthSaleItems?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0) +
                                (lastMonthServiceParts?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0);

      // Get unique customers
      const { data: customers } = await supabase
        .from('customers')
        .select('id, created_at');

      const activeCustomers = customers?.length || 0;
      
      // Calculate last month customers for comparison
      const lastMonthCustomers = customers?.filter(customer => {
        const createdDate = new Date(customer.created_at);
        return createdDate >= lastMonthStart && createdDate <= lastMonthEnd;
      }).length || 0;

      // Calculate percentage changes
      const revenueChange = lastMonthRevenue > 0 ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
      const partsChange = lastMonthPartsSold > 0 ? ((currentPartsSold - lastMonthPartsSold) / lastMonthPartsSold) * 100 : 0;
      const servicesChange = lastMonthServices && lastMonthServices.length > 0 ? 
        (((currentServices?.length || 0) - lastMonthServices.length) / lastMonthServices.length) * 100 : 0;
      const customersChange = lastMonthCustomers > 0 ? ((activeCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;

      // Revenue trend data for the last 6 months
      const revenueData = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const { data: monthSales } = await supabase
          .from('sales')
          .select('total_amount')
          .gte('sale_date', monthStart.toISOString().split('T')[0])
          .lte('sale_date', monthEnd.toISOString().split('T')[0]);

        const { data: monthServices } = await supabase
          .from('services')
          .select('total_cost')
          .gte('service_date', monthStart.toISOString().split('T')[0])
          .lte('service_date', monthEnd.toISOString().split('T')[0]);

        const monthSalesTotal = monthSales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
        const monthServicesTotal = monthServices?.reduce((sum, service) => sum + Number(service.total_cost), 0) || 0;

        revenueData.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthSalesTotal + monthServicesTotal,
          salesRevenue: monthSalesTotal,
          servicesRevenue: monthServicesTotal
        });
      }

      // Service types distribution
      const serviceTypeCounts: { [key: string]: number } = {};
      currentServices?.forEach(service => {
        const typeName = (service.service_types as any)?.name || 'Unknown';
        serviceTypeCounts[typeName] = (serviceTypeCounts[typeName] || 0) + 1;
      });

      const serviceTypeData = Object.entries(serviceTypeCounts).map(([name, count]) => ({
        type: name,
        count,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      }));

      // Top selling parts
      const partsSoldMap: { [key: string]: { quantity: number; revenue: number } } = {};
      
      saleItems?.forEach(item => {
        const partName = (item.spare_parts as any)?.part_name || 'Unknown';
        if (!partsSoldMap[partName]) {
          partsSoldMap[partName] = { quantity: 0, revenue: 0 };
        }
        partsSoldMap[partName].quantity += Number(item.quantity);
      });

      serviceParts?.forEach(item => {
        const partName = (item.spare_parts as any)?.part_name || 'Unknown';
        if (!partsSoldMap[partName]) {
          partsSoldMap[partName] = { quantity: 0, revenue: 0 };
        }
        partsSoldMap[partName].quantity += Number(item.quantity);
      });

      const totalPartsRevenue = Object.values(partsSoldMap).reduce((sum, part) => sum + part.revenue, 0);
      const topParts = Object.entries(partsSoldMap)
        .sort(([,a], [,b]) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(([name, data]) => ({
          name,
          quantity: data.quantity,
          revenue: data.revenue,
          percentage: totalPartsRevenue > 0 ? ((data.revenue / totalPartsRevenue) * 100) : 0,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`
        }));

      // Top customers by revenue
      const { data: topCustomersData } = await supabase
        .from('services')
        .select(`
          vehicles(customers(id, name)),
          total_cost,
          service_date
        `)
        .order('total_cost', { ascending: false })
        .limit(100);

      const customerRevenue: { [key: string]: { name: string; revenue: number; services: number; lastService: string } } = {};
      
      topCustomersData?.forEach(service => {
        const customer = (service.vehicles as any)?.customers;
        const customerId = customer?.id;
        const customerName = customer?.name || 'Unknown';
        
        if (customerId) {
          if (!customerRevenue[customerId]) {
            customerRevenue[customerId] = {
              name: customerName,
              revenue: 0,
              services: 0,
              lastService: service.service_date
            };
          }
          customerRevenue[customerId].revenue += Number(service.total_cost);
          customerRevenue[customerId].services += 1;
          if (service.service_date > customerRevenue[customerId].lastService) {
            customerRevenue[customerId].lastService = service.service_date;
          }
        }
      });

      const topCustomers = Object.values(customerRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(customer => ({
          name: customer.name,
          services: customer.services,
          totalSpent: customer.revenue,
          lastService: customer.lastService
        }));

      // Inventory alerts
      const { data: lowStockParts } = await supabase
        .from('spare_parts')
        .select('part_name, quantity_in_stock, reorder_threshold')
        .lte('quantity_in_stock', 50);

      const inventoryAlerts = lowStockParts?.filter(part => 
        Number(part.quantity_in_stock) <= Number(part.reorder_threshold)
      ).map(part => ({
        name: part.part_name,
        currentStock: Number(part.quantity_in_stock),
        reorderLevel: Number(part.reorder_threshold),
        alertLevel: Number(part.quantity_in_stock) < Number(part.reorder_threshold) * 0.5 ? 'critical' : 'low'
      })) || [];

      return {
        totalRevenue: currentRevenue,
        revenueChange,
        partsSold: currentPartsSold,
        partsChange,
        servicesCompleted: currentServices?.length || 0,
        servicesChange,
        activeCustomers,
        customersChange,
        revenueData,
        serviceTypeData,
        topParts,
        topCustomers,
        inventoryAlerts
      };
    },
  });
};

export const useMonthlyRevenueData = () => {
  const { data: reportsData } = useReportsData();
  return {
    data: reportsData?.revenueData || [],
    isLoading: false
  };
};

export const useServiceTypesData = () => {
  const { data: reportsData } = useReportsData();
  return {
    data: reportsData?.serviceTypeData || [],
    isLoading: false
  };
};

export const useTopSellingPartsData = () => {
  const { data: reportsData } = useReportsData();
  return {
    data: reportsData?.topParts || [],
    isLoading: false
  };
};

export const useTopCustomersData = () => {
  const { data: reportsData } = useReportsData();
  return {
    data: reportsData?.topCustomers || [],
    isLoading: false
  };
};
