
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Service = Tables<'services'>;
export type ServiceType = Tables<'service_types'>;
export type Vehicle = Tables<'vehicles'>;
export type Customer = Tables<'customers'>;
export type ServicePart = Tables<'service_parts'>;

export interface ServiceWithDetails extends Service {
  vehicles: Vehicle & {
    customers: Customer;
  };
  service_types: ServiceType;
  service_parts: (ServicePart & {
    spare_parts: {
      part_name: string;
      part_number: string;
    };
  })[];
}

export const useServicesData = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          vehicles (
            *,
            customers (*)
          ),
          service_types (*),
          service_parts (
            *,
            spare_parts (
              part_name,
              part_number
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ServiceWithDetails[];
    },
  });
};

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ['service_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as ServiceType[];
    },
  });
};

export const useCustomersData = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          vehicles (*)
        `)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateCustomerAndVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      customer, 
      vehicle 
    }: { 
      customer: TablesInsert<'customers'>; 
      vehicle: Omit<TablesInsert<'vehicles'>, 'customer_id'> 
    }) => {
      // Create customer first
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      
      if (customerError) throw customerError;
      
      // Then create vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          ...vehicle,
          customer_id: customerData.id,
        })
        .select()
        .single();
      
      if (vehicleError) throw vehicleError;
      
      return { customer: customerData, vehicle: vehicleData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      service, 
      parts 
    }: { 
      service: TablesInsert<'services'>; 
      parts: Omit<TablesInsert<'service_parts'>, 'service_id'>[] 
    }) => {
      // Create the service first
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .insert(service)
        .select()
        .single();
      
      if (serviceError) throw serviceError;
      
      // Then add the service parts if any
      if (parts.length > 0) {
        const serviceParts = parts.map(part => ({
          ...part,
          service_id: serviceData.id,
        }));
        
        const { error: partsError } = await supabase
          .from('service_parts')
          .insert(serviceParts);
        
        if (partsError) throw partsError;
      }
      
      return serviceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['spare_parts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
};

export const useUpcomingServices = () => {
  return useQuery({
    queryKey: ['upcoming_services'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          vehicles (
            *,
            customers (*)
          ),
          service_types (*)
        `)
        .gte('next_service_date', today)
        .lte('next_service_date', oneWeekFromNow)
        .order('next_service_date');
      
      if (error) throw error;
      return data as ServiceWithDetails[];
    },
  });
};
