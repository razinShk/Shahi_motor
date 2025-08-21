
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export const QuickAddDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAddPart = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const { error } = await supabase.from('spare_parts').insert({
        part_name: formData.get('part_name') as string,
        part_number: formData.get('part_number') as string,
        brand: formData.get('brand') as string,
        part_type: formData.get('part_type') as string,
        price: Number(formData.get('price')),
        quantity_in_stock: Number(formData.get('quantity')),
        reorder_threshold: Number(formData.get('reorder_threshold')) || 10,
      });

      if (error) throw error;
      
      toast({ title: 'Success', description: 'Part added successfully!' });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add part. Please try again.', variant: 'destructive' });
    }
  };

  const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const { error } = await supabase.from('customers').insert({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
      });

      if (error) throw error;
      
      toast({ title: 'Success', description: 'Customer added successfully!' });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add customer. Please try again.', variant: 'destructive' });
    }
  };

  const handleAddServiceType = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const { error } = await supabase.from('service_types').insert({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        base_price: Number(formData.get('base_price')),
        estimated_duration_hours: Number(formData.get('duration')),
      });

      if (error) throw error;
      
      toast({ title: 'Success', description: 'Service type added successfully!' });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add service type. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Quick Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Add</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="part" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="part">Spare Part</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="service">Service Type</TabsTrigger>
          </TabsList>
          
          <TabsContent value="part" className="space-y-4">
            <form onSubmit={handleAddPart} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="part_name">Part Name *</Label>
                  <Input id="part_name" name="part_name" required />
                </div>
                <div>
                  <Label htmlFor="part_number">Part Number *</Label>
                  <Input id="part_number" name="part_number" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand *</Label>
                  <Input id="brand" name="brand" required />
                </div>
                <div>
                  <Label htmlFor="part_type">Part Type *</Label>
                  <Select name="part_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engine">Engine</SelectItem>
                      <SelectItem value="Brake">Brake</SelectItem>
                      <SelectItem value="Suspension">Suspension</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Body">Body</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input id="price" name="price" type="number" step="0.01" required />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input id="quantity" name="quantity" type="number" required />
                </div>
                <div>
                  <Label htmlFor="reorder_threshold">Reorder Level</Label>
                  <Input id="reorder_threshold" name="reorder_threshold" type="number" defaultValue="10" />
                </div>
              </div>
              <Button type="submit" className="w-full">Add Part</Button>
            </form>
          </TabsContent>
          
          <TabsContent value="customer" className="space-y-4">
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input id="customer_name" name="name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" rows={3} />
              </div>
              <Button type="submit" className="w-full">Add Customer</Button>
            </form>
          </TabsContent>
          
          <TabsContent value="service" className="space-y-4">
            <form onSubmit={handleAddServiceType} className="space-y-4">
              <div>
                <Label htmlFor="service_name">Service Name *</Label>
                <Input id="service_name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_price">Base Price</Label>
                  <Input id="base_price" name="base_price" type="number" step="0.01" />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input id="duration" name="duration" type="number" />
                </div>
              </div>
              <Button type="submit" className="w-full">Add Service Type</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
