import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

const AdminPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        throw error;
      }
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('products').insert([
        {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          description: newProduct.description,
          image: newProduct.image,
          category: newProduct.category,
        },
      ]);
      if (error) {
        throw error;
      }
      fetchProducts();
      setShowAddForm(false);
      setNewProduct({
        name: '',
        price: '',
        description: '',
        image: '',
        category: '',
      });
    } catch (error: any) {
      console.error('Error adding product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) {
          throw error;
        }
        fetchProducts();
      } catch (error: any) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          price: editingProduct.price,
          description: editingProduct.description,
          image: editingProduct.image,
          category: editingProduct.category,
        })
        .eq('id', editingProduct.id);

      if (error) {
        throw error;
      }

      fetchProducts();
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Error updating product:', error);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingProduct) return;
    const { name, value } = e.target;
    setEditingProduct({ ...editingProduct, [name]: value });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      <div className="mb-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {showAddForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProduct} className="mb-4 p-4 bg-gray-100 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              placeholder="Name"
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              placeholder="Price"
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              name="category"
              value={newProduct.category}
              onChange={handleInputChange}
              placeholder="Category"
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              name="image"
              value={newProduct.image}
              onChange={handleInputChange}
              placeholder="Image URL"
              className="p-2 border rounded"
              required
            />
            <textarea
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="p-2 border rounded md:col-span-2"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
            Submit
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="py-2 px-4 border-b">{product.name}</td>
                <td className="py-2 px-4 border-b">${product.price}</td>
                <td className="py-2 px-4 border-b">{product.category}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => handleEditClick(product)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Product</h3>
            <form onSubmit={handleUpdateProduct} className="mt-2">
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  name="name"
                  value={editingProduct.name}
                  onChange={handleEditInputChange}
                  placeholder="Name"
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="number"
                  name="price"
                  value={editingProduct.price}
                  onChange={handleEditInputChange}
                  placeholder="Price"
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="category"
                  value={editingProduct.category}
                  onChange={handleEditInputChange}
                  placeholder="Category"
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="image"
                  value={editingProduct.image}
                  onChange={handleEditInputChange}
                  placeholder="Image URL"
                  className="p-2 border rounded"
                  required
                />
                <textarea
                  name="description"
                  value={editingProduct.description}
                  onChange={handleEditInputChange}
                  placeholder="Description"
                  className="p-2 border rounded"
                  required
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
