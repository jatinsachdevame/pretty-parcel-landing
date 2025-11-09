import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  discount_percentage: number;
  items: string[];
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_price: number;
  status: string;
  created_at: string;
}

interface DiscountCoupon {
  id: string;
  code: string;
  discount_percentage: number;
  valid_from: string;
  valid_to: string;
  applicable_product_ids: string[];
  usage_limit: number;
  times_used: number;
  active: boolean;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "birthday" as "birthday" | "wedding" | "corporate",
    discount_percentage: "0",
    items: ""
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPerPage] = useState(50);
  const [totalOrders, setTotalOrders] = useState(0);

  // Coupons state
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [isCouponsLoading, setIsCouponsLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [couponFormData, setCouponFormData] = useState({
    code: "",
    discount_percentage: "",
    valid_from: "",
    valid_to: "",
    applicable_product_ids: [] as string[],
    usage_limit: "",
    active: true
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
      fetchCoupons();
    }
  }, [isAdmin, ordersPage]);

  // Products functions
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch products");
    } else {
      setProducts(data || []);
    }
    setIsProductsLoading(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      return null;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = editingProduct?.image_url || null;
    
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const itemsArray = productFormData.items.split(',').map(item => item.trim()).filter(Boolean);
    
    const productData = {
      name: productFormData.name,
      description: productFormData.description,
      price: parseFloat(productFormData.price),
      category: productFormData.category,
      discount_percentage: parseFloat(productFormData.discount_percentage),
      image_url: imageUrl,
      items: itemsArray
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast.error("Failed to update product");
      } else {
        toast.success("Product updated successfully!");
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert([productData]);

      if (error) {
        toast.error("Failed to create product");
      } else {
        toast.success("Product created successfully!");
      }
    }

    setIsProductDialogOpen(false);
    resetProductForm();
    fetchProducts();
  };

  const handleProductDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete product");
    } else {
      toast.success("Product deleted successfully!");
      fetchProducts();
    }
  };

  const handleProductEdit = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category as "birthday" | "wedding" | "corporate",
      discount_percentage: product.discount_percentage.toString(),
      items: product.items.join(', ')
    });
    setIsProductDialogOpen(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setImageFile(null);
    setProductFormData({
      name: "",
      description: "",
      price: "",
      category: "birthday",
      discount_percentage: "0",
      items: ""
    });
  };

  // Orders functions
  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    
    const from = (ordersPage - 1) * ordersPerPage;
    const to = from + ordersPerPage - 1;

    const { data, error, count } = await supabase
      .from("orders")
      .select("*", { count: 'exact' })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      toast.error("Failed to fetch orders");
    } else {
      setOrders(data || []);
      setTotalOrders(count || 0);
    }
    setIsOrdersLoading(false);
  };

  // Coupons functions
  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from("discount_coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch coupons");
    } else {
      setCoupons(data || []);
    }
    setIsCouponsLoading(false);
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData = {
      code: couponFormData.code.toUpperCase(),
      discount_percentage: parseFloat(couponFormData.discount_percentage),
      valid_from: couponFormData.valid_from,
      valid_to: couponFormData.valid_to,
      applicable_product_ids: couponFormData.applicable_product_ids,
      usage_limit: parseInt(couponFormData.usage_limit),
      active: couponFormData.active
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from("discount_coupons")
        .update(couponData)
        .eq("id", editingCoupon.id);

      if (error) {
        toast.error("Failed to update coupon");
      } else {
        toast.success("Coupon updated successfully!");
      }
    } else {
      const { error } = await supabase
        .from("discount_coupons")
        .insert([couponData]);

      if (error) {
        toast.error("Failed to create coupon");
      } else {
        toast.success("Coupon created successfully!");
      }
    }

    setIsCouponDialogOpen(false);
    resetCouponForm();
    fetchCoupons();
  };

  const handleCouponDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    const { error } = await supabase
      .from("discount_coupons")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete coupon");
    } else {
      toast.success("Coupon deleted successfully!");
      fetchCoupons();
    }
  };

  const handleCouponEdit = (coupon: DiscountCoupon) => {
    setEditingCoupon(coupon);
    setCouponFormData({
      code: coupon.code,
      discount_percentage: coupon.discount_percentage.toString(),
      valid_from: new Date(coupon.valid_from).toISOString().slice(0, 16),
      valid_to: new Date(coupon.valid_to).toISOString().slice(0, 16),
      applicable_product_ids: coupon.applicable_product_ids,
      usage_limit: coupon.usage_limit.toString(),
      active: coupon.active
    });
    setIsCouponDialogOpen(true);
  };

  const resetCouponForm = () => {
    setEditingCoupon(null);
    setCouponFormData({
      code: "",
      discount_percentage: "",
      valid_from: "",
      valid_to: "",
      applicable_product_ids: [],
      usage_limit: "",
      active: true
    });
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount / 100);
  };

  if (adminLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>
      
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="coupons">Discount Coupons</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders ({totalOrders} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <div className="text-center py-8">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No orders found</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell>{order.customer_email}</TableCell>
                          <TableCell>{order.customer_phone}</TableCell>
                          <TableCell className="font-semibold">₹{order.total_price.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {ordersPage} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                          disabled={ordersPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOrdersPage(p => Math.min(totalPages, p + 1))}
                          disabled={ordersPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Products Management</h2>
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetProductForm}>
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={productFormData.name}
                      onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={productFormData.description}
                      onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={productFormData.price}
                        onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={productFormData.discount_percentage}
                        onChange={(e) => setProductFormData({ ...productFormData, discount_percentage: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={productFormData.category} onValueChange={(value: any) => setProductFormData({ ...productFormData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="items">Items (comma-separated)</Label>
                    <Textarea
                      id="items"
                      placeholder="Item 1, Item 2, Item 3"
                      value={productFormData.items}
                      onChange={(e) => setProductFormData({ ...productFormData, items: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image">Product Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    {editingProduct?.image_url && (
                      <p className="text-sm text-muted-foreground mt-1">Current image will be replaced if you upload a new one</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingProduct ? "Update Product" : "Create Product"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Final Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.discount_percentage}%</TableCell>
                      <TableCell className="font-semibold">
                        ₹{calculateDiscountedPrice(product.price, product.discount_percentage).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleProductEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleProductDelete(product.id)}>
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
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Discount Coupons</h2>
            <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetCouponForm}>
                  <Plus className="mr-2 h-4 w-4" /> Add Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCouponSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                      id="code"
                      value={couponFormData.code}
                      onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                      placeholder="SUMMER2024"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={couponFormData.discount_percentage}
                      onChange={(e) => setCouponFormData({ ...couponFormData, discount_percentage: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="valid_from">Valid From</Label>
                      <Input
                        id="valid_from"
                        type="datetime-local"
                        value={couponFormData.valid_from}
                        onChange={(e) => setCouponFormData({ ...couponFormData, valid_from: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="valid_to">Valid To</Label>
                      <Input
                        id="valid_to"
                        type="datetime-local"
                        value={couponFormData.valid_to}
                        onChange={(e) => setCouponFormData({ ...couponFormData, valid_to: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="products">Applicable Products</Label>
                    <Select
                      value={couponFormData.applicable_product_ids.length > 0 ? "selected" : ""}
                      onValueChange={(value) => {
                        if (value === "all") {
                          setCouponFormData({ ...couponFormData, applicable_product_ids: products.map(p => p.id) });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select products" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        {products.map((product) => (
                          <SelectItem 
                            key={product.id} 
                            value={product.id}
                            onClick={() => {
                              const ids = couponFormData.applicable_product_ids;
                              if (ids.includes(product.id)) {
                                setCouponFormData({ 
                                  ...couponFormData, 
                                  applicable_product_ids: ids.filter(id => id !== product.id) 
                                });
                              } else {
                                setCouponFormData({ 
                                  ...couponFormData, 
                                  applicable_product_ids: [...ids, product.id] 
                                });
                              }
                            }}
                          >
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      {couponFormData.applicable_product_ids.length} product(s) selected
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="usage_limit">Usage Limit</Label>
                    <Input
                      id="usage_limit"
                      type="number"
                      min="0"
                      value={couponFormData.usage_limit}
                      onChange={(e) => setCouponFormData({ ...couponFormData, usage_limit: e.target.value })}
                      placeholder="50"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Maximum number of times this coupon can be used
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={couponFormData.active}
                      onChange={(e) => setCouponFormData({ ...couponFormData, active: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingCoupon ? "Update Coupon" : "Create Coupon"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCouponDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isCouponsLoading ? (
                <div className="text-center py-8">Loading coupons...</div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No coupons found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Valid Period</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                        <TableCell>{coupon.discount_percentage}%</TableCell>
                        <TableCell className="text-sm">
                          {new Date(coupon.valid_from).toLocaleDateString('en-IN')} - {new Date(coupon.valid_to).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell>{coupon.applicable_product_ids.length} products</TableCell>
                        <TableCell>
                          {coupon.times_used} / {coupon.usage_limit}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {coupon.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleCouponEdit(coupon)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleCouponDelete(coupon.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;