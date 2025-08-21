
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Download, Loader2 } from 'lucide-react';
import { useServicesData } from '@/hooks/useServicesData';

const ServiceHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('all');

  const { data: services, isLoading } = useServicesData();

  // Get unique vehicles for filter
  const uniqueVehicles = services ? [...new Map(services.map(service => [
    service.vehicles.id, 
    `${service.vehicles.make} ${service.vehicles.model} (${service.vehicles.registration_number})`
  ])).values()] : [];

  const filteredServices = services?.filter(service => {
    const matchesSearch = service.vehicles.customers.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${service.vehicles.make} ${service.vehicles.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.service_types.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = selectedVehicle === 'all' || 
                          `${service.vehicles.make} ${service.vehicles.model} (${service.vehicles.registration_number})` === selectedVehicle;
    return matchesSearch && matchesVehicle;
  });

  // Group services by vehicle
  const groupedServices = filteredServices?.reduce((groups, service) => {
    const vehicleKey = `${service.vehicles.make} ${service.vehicles.model} (${service.vehicles.registration_number})`;
    if (!groups[vehicleKey]) {
      groups[vehicleKey] = [];
    }
    groups[vehicleKey].push(service);
    return groups;
  }, {} as Record<string, typeof services>) || {};

  const generateServiceReport = (vehicleInfo: string) => {
    const vehicleServices = Object.values(groupedServices).flat().filter(service => 
      `${service.vehicles.make} ${service.vehicles.model} (${service.vehicles.registration_number})` === vehicleInfo
    );
    
    const reportData = {
      vehicle: vehicleInfo,
      totalServices: vehicleServices.length,
      totalCost: vehicleServices.reduce((sum, service) => sum + Number(service.total_cost), 0),
      services: vehicleServices
    };

    console.log('Generating service report:', reportData);
    
    // In a real app, this would generate and download a PDF
    alert(`Service report for ${vehicleInfo} has been generated. Total services: ${reportData.totalServices}, Total cost: $${reportData.totalCost.toFixed(2)}`);
  };

  const isServiceDue = (nextServiceDate: string | null) => {
    if (!nextServiceDate) return false;
    const today = new Date();
    const serviceDate = new Date(nextServiceDate);
    const daysUntilService = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilService <= 7;
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold">Service History</h1>
          <p className="text-gray-600">Complete service records and maintenance history</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by customer, vehicle, or service type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filter by vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {uniqueVehicles.map((vehicle, index) => (
                  <SelectItem key={index} value={vehicle}>{vehicle}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service History by Vehicle */}
      <div className="space-y-6">
        {Object.entries(groupedServices).map(([vehicle, vehicleServices]) => (
          <Card key={vehicle}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">{vehicle}</CardTitle>
                <p className="text-gray-600">
                  {vehicleServices.length} service record{vehicleServices.length !== 1 ? 's' : ''} • 
                  Total spent: ${vehicleServices.reduce((sum, service) => sum + Number(service.total_cost), 0).toFixed(2)}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateServiceReport(vehicle)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export History
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicleServices
                  .sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime())
                  .map((service, index) => (
                  <div key={service.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {/* Service Info */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{service.service_types.name}</h4>
                          {index === 0 && service.next_service_date && isServiceDue(service.next_service_date) && (
                            <Badge variant="destructive" className="text-xs">
                              Service Due Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Date: {service.service_date}</p>
                        <p className="text-sm text-gray-600">
                          Mileage: {service.mileage ? `${service.mileage.toLocaleString()} km` : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Customer: {service.vehicles.customers.name}</p>
                      </div>

                      {/* Parts Used */}
                      <div>
                        <h5 className="font-medium mb-2">Parts Used</h5>
                        <div className="space-y-1">
                          {service.service_parts.length > 0 ? (
                            service.service_parts.map((part, partIndex) => (
                              <Badge key={partIndex} variant="secondary" className="text-xs mr-1 mb-1">
                                {part.spare_parts.part_name} x{part.quantity}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No parts used</p>
                          )}
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div>
                        <h5 className="font-medium mb-2">Cost Breakdown</h5>
                        <p className="text-sm">Labor: ${service.labor_charges.toFixed(2)}</p>
                        <p className="text-sm">
                          Parts: ${service.service_parts.reduce((sum, part) => sum + Number(part.subtotal), 0).toFixed(2)}
                        </p>
                        <p className="text-sm font-semibold">Total: ${service.total_cost.toFixed(2)}</p>
                      </div>

                      {/* Next Service */}
                      <div>
                        <h5 className="font-medium mb-2">Next Service</h5>
                        {service.next_service_date ? (
                          <div className="flex items-center space-x-1 mb-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="text-sm">{service.next_service_date}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Not scheduled</p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {service.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="font-medium mb-2">Service Notes</h5>
                        <p className="text-sm text-gray-600">{service.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices?.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No service records found matching your search criteria.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceHistory;
