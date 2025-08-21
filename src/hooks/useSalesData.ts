
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Sale = Tables<'sales'>;
export type SaleItem = Tables<'sale_items'>;
export type SaleInsert = TablesInsert<'sales'>;
export type SaleItemInsert = TablesInsert<'sale_items'>;

export interface SaleWithItems extends Sale {
  sale_items: (SaleItem & {
    spare_parts: {
      part_name: string;
      part_number: string;
    };
  })[];
}

export const useSalesData = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            spare_parts (
              part_name,
              part_number
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SaleWithItems[];
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      sale, 
      items 
    }: { 
      sale: SaleInsert; 
      items: Omit<SaleItemInsert, 'sale_id'>[] 
    }) => {
      // Create the sale first
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert(sale)
        .select()
        .single();
      
      if (saleError) throw saleError;
      
      // Then add the sale items
      const saleItems = items.map(item => ({
        ...item,
        sale_id: saleData.id,
      }));
      
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);
      
      if (itemsError) throw itemsError;
      
      return saleData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['spare_parts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
};

export const useSalesStats = () => {
  return useQuery({
    queryKey: ['sales_stats'],
    queryFn: async () => {
      // Get current month sales
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      const { data: monthlySales, error: monthlyError } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('sale_date', `${currentMonth}-01`)
        .lt('sale_date', `${currentMonth}-31`);
      
      if (monthlyError) throw monthlyError;
      
      // Get top selling parts
      const { data: topParts, error: topPartsError } = await supabase
        .from('sale_items')
        .select(`
          spare_part_id,
          quantity,
          spare_parts (
            part_name
          )
        `);
      
      if (topPartsError) throw topPartsError;
      
      // Calculate top selling parts
      const partsSummary = topParts.reduce((acc: any, item: any) => {
        const partName = item.spare_parts.part_name;
        if (!acc[partName]) {
          acc[partName] = 0;
        }
        acc[partName] += item.quantity;
        return acc;
      }, {});
      
      const topSellingParts = Object.entries(partsSummary)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 5);
      
      return {
        monthlyRevenue: monthlySales.reduce((sum, sale) => sum + Number(sale.total_amount), 0),
        topSellingParts,
      };
    },
  });
};
