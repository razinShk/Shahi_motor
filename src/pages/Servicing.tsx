import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wrench, User, Car, Loader2, Trash2 } from 'lucide-react';
import { useServicesData, useServiceTypes, useCreateCustomerAndVehicle, useCreateService } from '@/hooks/useServicesData';
import { useSparePartsData } from '@/hooks/useSparePartsData';
import { useToast } from '@/hooks/use-toast';
import { ServiceInvoice } from '@/components/ServiceInvoice';

const Servicing = () => {
  const { toast } = useToast();
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [serviceStep, setServiceStep] = useState(1); // 1: Customer/Vehicle, 2: Service Details
  const [serviceParts, setServiceParts] = useState<any[]>([]);
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    registration_number: '',
  });

  const [newService, setNewService] = useState({
    vehicle_id: '',
    service_type_id: '',
    mileage: '',
    labor_charges: '',
    notes: '',
    next_service_date: '',
  });

  const { data: services, isLoading } = useServicesData();
  const { data: serviceTypes } = useServiceTypes();
  const { data: spareParts } = useSparePartsData();
  const createCustomerMutation = useCreateCustomerAndVehicle();
  const createServiceMutation = useCreateService();

  const addPartToService = () => {
    setServiceParts([...serviceParts, {
      spare_part_id: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0,
    }]);
  };

  const removePartFromService = (index: number) => {
    const updatedParts = serviceParts.filter((_, i) => i !== index);
    setServiceParts(updatedParts);
  };

  const updateServicePart = (index: number, field: string, value: any) => {
    const updatedParts = [...serviceParts];
    updatedParts[index][field] = value;
    
    if (field === 'spare_part_id') {
      const selectedPart = spareParts?.find(part => part.id === value);
      if (selectedPart) {
        updatedParts[index].unit_price = selectedPart.price;
        updatedParts[index].subtotal = selectedPart.price * updatedParts[index].quantity;
      }
    }
    
    if (field === 'quantity') {
      updatedParts[index].subtotal = updatedParts[index].unit_price * value;
    }
    
    setServiceParts(updatedParts);
  };

  const getTotalPartsAmount = () => {
    return serviceParts.reduce((total, part) => total + part.subtotal, 0);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newVehicle.make || !newVehicle.model || !newVehicle.year || !newVehicle.registration_number) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createCustomerMutation.mutateAsync({
        customer: newCustomer,
        vehicle: {
          ...newVehicle,
          year: parseInt(newVehicle.year),
        },
      });

      setNewService({ ...newService, vehicle_id: result.vehicle.id });
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
      setNewVehicle({ make: '', model: '', year: '', registration_number: '' });
      setIsCreateCustomerOpen(false);
      setServiceStep(2);

      toast({
        title: "Success",
        description: "Customer and vehicle added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer and vehicle",
        variant: "destructive",
      });
    }
  };

  const handleCreateService = async () => {
    if (!newService.vehicle_id || !newService.service_type_id) {
      toast({
        title: "Error",
        description: "Please select vehicle and service type",
        variant: "destructive",
      });
      return;
    }

    try {
      await createServiceMutation.mutateAsync({
        service: {
          vehicle_id: newService.vehicle_id,
          service_type_id: newService.service_type_id,
          mileage: newService.mileage ? parseInt(newService.mileage) : null,
          labor_charges: parseFloat(newService.labor_charges) || 0,
          notes: newService.notes,
          next_service_date: newService.next_service_date || null,
        },
        parts: serviceParts,
      });

      setNewService({
        vehicle_id: '',
        service_type_id: '',
        mileage: '',
        labor_charges: '',
        notes: '',
        next_service_date: '',
      });
      setServiceParts([]);
      setServiceStep(1);
      setIsCreateServiceOpen(false);

      toast({
        title: "Success",
        description: "Service record created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service record",
        variant: "destructive",
      });
    }
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
          <h1 className="text-3xl font-bold">Car Servicing Management</h1>
          <p className="text-gray-600">Manage vehicle services and maintenance</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isCreateCustomerOpen} onOpenChange={setIsCreateCustomerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer & Vehicle</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h3 className="font-medium">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_name">Name *</Label>
                      <Input
                        id="customer_name"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_phone">Phone</Label>
                      <Input
                        id="customer_phone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customer_email">Email</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_address">Address</Label>
                    <Textarea
                      id="customer_address"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      placeholder="Customer address"
                    />
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="space-y-4">
                  <h3 className="font-medium">Vehicle Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicle_make">Make *</Label>
                      <Input
                        id="vehicle_make"
                        value={newVehicle.make}
                        onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                        placeholder="Toyota, Honda, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicle_model">Model *</Label>
                      <Input
                        id="vehicle_model"
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                        placeholder="Camry, Civic, etc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicle_year">Year *</Label>
                      <Input
                        id="vehicle_year"
                        type="number"
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicle_registration">Registration Number *</Label>
                      <Input
                        id="vehicle_registration"
                        value={newVehicle.registration_number}
                        onChange={(e) => setNewVehicle({ ...newVehicle, registration_number: e.target.value })}
                        placeholder="ABC-123"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleCreateCustomer} className="w-full" disabled={createCustomerMutation.isPending}>
                  {createCustomerMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <User className="mr-2 h-4 w-4" />
                  )}
                  Add Customer & Vehicle
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateServiceOpen} onOpenChange={setIsCreateServiceOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Service Record</DialogTitle>
              </DialogHeader>
              
              {serviceStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="select_vehicle">Select Vehicle</Label>
                    <Select
                      value={newService.vehicle_id}
                      onValueChange={(value) => setNewService({ ...newService, vehicle_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vehicle for service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services?.map((service) => (
                          <SelectItem key={service.vehicles.id} value={service.vehicles.id}>
                            {service.vehicles.customers.name} - {service.vehicles.make} {service.vehicles.model} ({service.vehicles.registration_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Don't see the vehicle? Add a new customer and vehicle first.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateServiceOpen(false);
                        setIsCreateCustomerOpen(true);
                      }}
                    >
                      <Car className="mr-2 h-4 w-4" />
                      Add New Customer & Vehicle
                    </Button>
                  </div>

                  <Button 
                    onClick={() => setServiceStep(2)} 
                    className="w-full"
                    disabled={!newService.vehicle_id}
                  >
                    Continue to Service Details
                  </Button>
                </div>
              )}

              {serviceStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service_type">Service Type</Label>
                      <Select
                        value={newService.service_type_id}
                        onValueChange={(value) => setNewService({ ...newService, service_type_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name} - ₹{type.base_price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mileage">Current Mileage</Label>
                      <Input
                        id="mileage"
                        type="number"
                        value={newService.mileage}
                        onChange={(e) => setNewService({ ...newService, mileage: e.target.value })}
                        placeholder="Current vehicle mileage"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="labor_charges">Labor Charges (₹)</Label>
                      <Input
                        id="labor_charges"
                        type="number"
                        step="0.01"
                        value={newService.labor_charges}
                        onChange={(e) => setNewService({ ...newService, labor_charges: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="next_service_date">Next Service Date</Label>
                      <Input
                        id="next_service_date"
                        type="date"
                        value={newService.next_service_date}
                        onChange={(e) => setNewService({ ...newService, next_service_date: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Service Parts */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label>Parts Used</Label>
                      <Button type="button" variant="outline" onClick={addPartToService}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Part
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {serviceParts.map((part, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                          <div className="col-span-4">
                            <Label>Part</Label>
                            <Select
                              value={part.spare_part_id}
                              onValueChange={(value) => updateServicePart(index, 'spare_part_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select part" />
                              </SelectTrigger>
                              <SelectContent>
                                {spareParts?.filter(sparePart => sparePart.quantity_in_stock > 0).map((sparePart) => (
                                  <SelectItem key={sparePart.id} value={sparePart.id}>
                                    {sparePart.part_name} - ₹{sparePart.price} (Stock: {sparePart.quantity_in_stock})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={part.quantity}
                              onChange={(e) => updateServicePart(index, 'quantity', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={part.unit_price}
                              onChange={(e) => updateServicePart(index, 'unit_price', parseFloat(e.target.value))}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Subtotal</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={part.subtotal}
                              readOnly
                              className="bg-gray-50"
                            />
                          </div>
                          <div className="col-span-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removePartFromService(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {serviceParts.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Labor Charges:</span>
                            <span>₹{parseFloat(newService.labor_charges || '0').toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Parts Total:</span>
                            <span>₹{getTotalPartsAmount().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center font-bold border-t pt-2">
                            <span>Total Cost:</span>
                            <span className="text-xl">₹{(parseFloat(newService.labor_charges || '0') + getTotalPartsAmount()).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes">Service Notes</Label>
                    <Textarea
                      id="notes"
                      value={newService.notes}
                      onChange={(e) => setNewService({ ...newService, notes: e.target.value })}
                      placeholder="Additional notes about the service..."
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setServiceStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleCreateService} className="flex-1" disabled={createServiceMutation.isPending}>
                      {createServiceMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Wrench className="mr-2 h-4 w-4" />
                      )}
                      Create Service Record
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Recent Services */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Service Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services?.slice(0, 10).map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <h4 className="font-medium">{service.vehicles.customers.name}</h4>
                    <p className="text-sm text-gray-600">
                      {service.vehicles.make} {service.vehicles.model} ({service.vehicles.registration_number})
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">{service.service_types.name}</p>
                    <p className="text-sm text-gray-600">{service.service_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {service.mileage ? `${service.mileage.toLocaleString()} km` : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ₹{service.total_cost}
                    </p>
                  </div>
                  <div>
                    {service.next_service_date && (
                      <p className="text-sm">
                        Next Service: {service.next_service_date}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <ServiceInvoice service={service} />
                  </div>
                </div>
                {service.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">{service.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Servicing;
