
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get current month revenue from sales and services
      const [salesResult, servicesResult] = await Promise.all([
        supabase
          .from('sales')
          .select('total_amount')
          .gte('sale_date', currentMonthStart.toISOString().split('T')[0]),
        supabase
          .from('services')
          .select('total_cost')
          .gte('service_date', currentMonthStart.toISOString().split('T')[0])
      ]);

      const currentRevenue = 
        (salesResult.data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0) +
        (servicesResult.data?.reduce((sum, service) => sum + Number(service.total_cost), 0) || 0);

      // Get parts sold this month
      const [saleItemsResult, servicePartsResult] = await Promise.all([
        supabase
          .from('sale_items')
          .select('quantity, sales!inner(sale_date)')
          .gte('sales.sale_date', currentMonthStart.toISOString().split('T')[0]),
        supabase
          .from('service_parts')
          .select('quantity, services!inner(service_date)')
          .gte('services.service_date', currentMonthStart.toISOString().split('T')[0])
      ]);

      const partsSold = 
        (saleItemsResult.data?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0) +
        (servicePartsResult.data?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0);

      // Get services completed
      const servicesCompleted = servicesResult.data?.length || 0;

      // Get low stock alerts
      const { data: lowStockParts } = await supabase
        .from('spare_parts')
        .select('part_name, quantity_in_stock, reorder_threshold')
        .lte('quantity_in_stock', supabase.raw('reorder_threshold'));

      const lowStockAlerts = lowStockParts?.length || 0;

      // Get upcoming services (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: upcomingServices } = await supabase
        .from('services')
        .select(`
          *,
          vehicles(
            *,
            customers(name)
          ),
          service_types(name)
        `)
        .gte('next_service_date', now.toISOString().split('T')[0])
        .lte('next_service_date', nextWeek.toISOString().split('T')[0])
        .order('next_service_date');

      // Recent activity - last 5 services and sales
      const [recentServices, recentSales] = await Promise.all([
        supabase
          .from('services')
          .select(`
            *,
            vehicles(
              *,
              customers(name)
            ),
            service_types(name)
          `)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('sales')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(2)
      ]);

      const recentActivity = [
        ...(recentServices.data?.map(service => ({
          id: service.id,
          type: 'service' as const,
          description: `${service.service_types.name} for ${service.vehicles.customers.name}`,
          amount: service.total_cost,
          date: service.service_date,
        })) || []),
        ...(recentSales.data?.map(sale => ({
          id: sale.id,
          type: 'sale' as const,
          description: `Sale to ${sale.customer_name}`,
          amount: sale.total_amount,
          date: sale.sale_date,
        })) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      return {
        revenue: currentRevenue,
        partsSold,
        servicesCompleted,
        lowStockAlerts,
        upcomingServices: upcomingServices || [],
        recentActivity,
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
