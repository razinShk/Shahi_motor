
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { supabase } from '@/integrations/supabase/client';
import { Search, Package, User, Wrench, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'part' | 'customer' | 'service' | 'vehicle';
  data: any;
}

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchDatabase = async () => {
      try {
        // Search spare parts
        const { data: parts } = await supabase
          .from('spare_parts')
          .select('*')
          .or(`part_name.ilike.%${query}%,part_number.ilike.%${query}%,brand.ilike.%${query}%`)
          .limit(5);

        // Search customers
        const { data: customers } = await supabase
          .from('customers')
          .select('*')
          .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
          .limit(5);

        // Search vehicles
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select(`
            *,
            customers (name)
          `)
          .or(`make.ilike.%${query}%,model.ilike.%${query}%,registration_number.ilike.%${query}%`)
          .limit(5);

        // Search services
        const { data: services } = await supabase
          .from('services')
          .select(`
            *,
            vehicles (
              make,
              model,
              customers (name)
            )
          `)
          .limit(3);

        const searchResults: SearchResult[] = [];

        // Add parts to results
        parts?.forEach(part => {
          searchResults.push({
            id: part.id,
            title: part.part_name,
            subtitle: `${part.brand} - $${part.price} (Stock: ${part.quantity_in_stock})`,
            type: 'part',
            data: part
          });
        });

        // Add customers to results
        customers?.forEach(customer => {
          searchResults.push({
            id: customer.id,
            title: customer.name,
            subtitle: customer.email || customer.phone || 'No contact info',
            type: 'customer',
            data: customer
          });
        });

        // Add vehicles to results
        vehicles?.forEach(vehicle => {
          searchResults.push({
            id: vehicle.id,
            title: `${vehicle.make} ${vehicle.model}`,
            subtitle: `${vehicle.registration_number} - ${vehicle.customers.name}`,
            type: 'vehicle',
            data: vehicle
          });
        });

        // Add relevant services to results
        services?.forEach(service => {
          if (service.vehicles.customers.name.toLowerCase().includes(query.toLowerCase()) ||
              service.vehicles.make.toLowerCase().includes(query.toLowerCase()) ||
              service.vehicles.model.toLowerCase().includes(query.toLowerCase())) {
            searchResults.push({
              id: service.id,
              title: `Service for ${service.vehicles.make} ${service.vehicles.model}`,
              subtitle: `${service.vehicles.customers.name} - ${service.service_date}`,
              type: 'service',
              data: service
            });
          }
        });

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const debounceTimer = setTimeout(searchDatabase, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    
    switch (result.type) {
      case 'part':
        navigate('/inventory');
        break;
      case 'customer':
        navigate('/servicing');
        break;
      case 'vehicle':
        navigate('/service-history');
        break;
      case 'service':
        navigate('/service-history');
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'part': return <Package className="h-4 w-4" />;
      case 'customer': return <User className="h-4 w-4" />;
      case 'service': return <Wrench className="h-4 w-4" />;
      case 'vehicle': return <Car className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search... (Ctrl+K)"
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onClick={() => setIsOpen(true)}
          readOnly
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0">
          <Command className="rounded-lg border shadow-md">
            <CommandInput
              placeholder="Search parts, customers, vehicles, services..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {results.length > 0 && (
                <CommandGroup heading="Results">
                  {results.map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center space-x-3 p-3"
                    >
                      {getIcon(result.type)}
                      <div className="flex-1">
                        <div className="font-medium">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-sm text-gray-500">{result.subtitle}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {result.type}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};
