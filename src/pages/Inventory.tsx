
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useSparePartsData, useAddSparePart, useUpdateSparePart, useDeleteSparePart, useLowStockParts } from '@/hooks/useSparePartsData';
import { useToast } from '@/hooks/use-toast';

const Inventory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  const [newPart, setNewPart] = useState({
    part_name: '',
    part_type: '',
    brand: '',
    part_number: '',
    price: '',
    quantity_in_stock: '',
    reorder_threshold: '',
  });

  const { data: spareParts, isLoading } = useSparePartsData();
  const { data: lowStockParts } = useLowStockParts();
  const addPartMutation = useAddSparePart();
  const updatePartMutation = useUpdateSparePart();
  const deletePartMutation = useDeleteSparePart();

  const filteredParts = spareParts?.filter(part =>
    part.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPart = async () => {
    try {
      await addPartMutation.mutateAsync({
        part_name: newPart.part_name,
        part_type: newPart.part_type,
        brand: newPart.brand,
        part_number: newPart.part_number,
        price: parseFloat(newPart.price),
        quantity_in_stock: parseInt(newPart.quantity_in_stock),
        reorder_threshold: parseInt(newPart.reorder_threshold),
      });
      
      setNewPart({
        part_name: '',
        part_type: '',
        brand: '',
        part_number: '',
        price: '',
        quantity_in_stock: '',
        reorder_threshold: '',
      });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Spare part added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add spare part",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePart = async () => {
    if (!editingPart) return;
    
    try {
      await updatePartMutation.mutateAsync({
        id: editingPart.id,
        updates: {
          part_name: editingPart.part_name,
          part_type: editingPart.part_type,
          brand: editingPart.brand,
          part_number: editingPart.part_number,
          price: parseFloat(editingPart.price),
          quantity_in_stock: parseInt(editingPart.quantity_in_stock),
          reorder_threshold: parseInt(editingPart.reorder_threshold),
        },
      });
      
      setEditingPart(null);
      
      toast({
        title: "Success",
        description: "Spare part updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update spare part",
        variant: "destructive",
      });
    }
  };

  const handleDeletePart = async (id: string) => {
    try {
      await deletePartMutation.mutateAsync(id);
      
      toast({
        title: "Success",
        description: "Spare part deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete spare part",
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
          <h1 className="text-3xl font-bold">Spare Parts Inventory</h1>
          <p className="text-gray-600">Manage your spare parts stock and inventory</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Part
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Spare Part</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="part_name">Part Name</Label>
                <Input
                  id="part_name"
                  value={newPart.part_name}
                  onChange={(e) => setNewPart({ ...newPart, part_name: e.target.value })}
                  placeholder="Enter part name"
                />
              </div>
              <div>
                <Label htmlFor="part_type">Part Type</Label>
                <Input
                  id="part_type"
                  value={newPart.part_type}
                  onChange={(e) => setNewPart({ ...newPart, part_type: e.target.value })}
                  placeholder="Enter part type"
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={newPart.brand}
                  onChange={(e) => setNewPart({ ...newPart, brand: e.target.value })}
                  placeholder="Enter brand"
                />
              </div>
              <div>
                <Label htmlFor="part_number">Part Number</Label>
                <Input
                  id="part_number"
                  value={newPart.part_number}
                  onChange={(e) => setNewPart({ ...newPart, part_number: e.target.value })}
                  placeholder="Enter part number"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newPart.price}
                    onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newPart.quantity_in_stock}
                    onChange={(e) => setNewPart({ ...newPart, quantity_in_stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="threshold">Reorder Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newPart.reorder_threshold}
                  onChange={(e) => setNewPart({ ...newPart, reorder_threshold: e.target.value })}
                  placeholder="10"
                />
              </div>
              <Button onClick={handleAddPart} className="w-full" disabled={addPartMutation.isPending}>
                {addPartMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Part'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockParts && lowStockParts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              {lowStockParts.length} item(s) are running low on stock and need to be reordered.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by part name, number, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parts Inventory ({filteredParts?.length || 0} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts?.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.part_name}</TableCell>
                  <TableCell>{part.part_type}</TableCell>
                  <TableCell>{part.brand}</TableCell>
                  <TableCell>{part.part_number}</TableCell>
                  <TableCell>₹{part.price}</TableCell>
                  <TableCell>{part.quantity_in_stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        part.quantity_in_stock <= 0
                          ? 'destructive'
                          : part.quantity_in_stock <= part.reorder_threshold
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {part.quantity_in_stock <= 0
                        ? 'Out of Stock'
                        : part.quantity_in_stock <= part.reorder_threshold
                        ? 'Low Stock'
                        : 'In Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPart(part)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePart(part.id)}
                        disabled={deletePartMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingPart} onOpenChange={() => setEditingPart(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Spare Part</DialogTitle>
          </DialogHeader>
          {editingPart && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_part_name">Part Name</Label>
                <Input
                  id="edit_part_name"
                  value={editingPart.part_name}
                  onChange={(e) => setEditingPart({ ...editingPart, part_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_part_type">Part Type</Label>
                <Input
                  id="edit_part_type"
                  value={editingPart.part_type}
                  onChange={(e) => setEditingPart({ ...editingPart, part_type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_brand">Brand</Label>
                <Input
                  id="edit_brand"
                  value={editingPart.brand}
                  onChange={(e) => setEditingPart({ ...editingPart, brand: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_part_number">Part Number</Label>
                <Input
                  id="edit_part_number"
                  value={editingPart.part_number}
                  onChange={(e) => setEditingPart({ ...editingPart, part_number: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_price">Price (₹)</Label>
                  <Input
                    id="edit_price"
                    type="number"
                    step="0.01"
                    value={editingPart.price}
                    onChange={(e) => setEditingPart({ ...editingPart, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_quantity">Quantity</Label>
                  <Input
                    id="edit_quantity"
                    type="number"
                    value={editingPart.quantity_in_stock}
                    onChange={(e) => setEditingPart({ ...editingPart, quantity_in_stock: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit_threshold">Reorder Threshold</Label>
                <Input
                  id="edit_threshold"
                  type="number"
                  value={editingPart.reorder_threshold}
                  onChange={(e) => setEditingPart({ ...editingPart, reorder_threshold: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdatePart} className="w-full" disabled={updatePartMutation.isPending}>
                {updatePartMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Part'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
