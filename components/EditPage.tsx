
import React, { useState } from 'react';
import { MenuItem } from '../types';
import { MenuItemForm } from './MenuItemForm';
import { Modal } from './Modal';
import { Plus, Edit2, Trash2, Upload, Download, Search } from 'lucide-react';

interface EditPageProps {
  items: MenuItem[];
  onAdd: (item: Omit<MenuItem, 'id'>) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const EditPage: React.FC<EditPageProps> = ({ items, onAdd, onEdit, onDelete, onExport, onImport }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenAdd = () => {
      setEditingItem(null);
      setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
      setEditingItem(item);
      setIsModalOpen(true);
  };

  const handleSubmit = (data: Omit<MenuItem, 'id'> | MenuItem) => {
      if ('id' in data) onEdit(data as MenuItem);
      else onAdd(data);
      setIsModalOpen(false);
  };

  // Wrapper to ensure we don't pass the event object to onExport
  const handleExportClick = () => {
      onExport();
  };

  const filteredItems = items.filter(item => item.dish_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-[#121212] p-4 md:p-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-white">Food Items</h2>
          
          <div className="flex gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                <input 
                    type="text" placeholder="Search..." 
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-green-500 outline-none text-sm"
                />
             </div>
             <button onClick={handleOpenAdd} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-green-500 transition-colors whitespace-nowrap">
                  <Plus size={18} /> Add New
             </button>
          </div>
      </div>

      {/* Tool Bar */}
      <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 text-blue-400 hover:text-blue-300 cursor-pointer text-sm font-medium">
            <Upload size={16} /> Import JSON
            <input type="file" accept=".json" className="hidden" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
          </label>
          <button onClick={handleExportClick} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium">
            <Download size={16} /> Export JSON
          </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-[#1e1e1e] rounded-2xl border border-[#333]">
          <table className="w-full text-left border-collapse">
              <thead className="bg-[#252525] text-gray-400 text-xs uppercase font-semibold sticky top-0 z-10">
                  <tr>
                      <th className="p-4">Item Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                  {filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-[#252525] transition-colors group">
                          <td className="p-4">
                              <div className="flex items-center gap-3">
                                  <img src={item.photo_link || 'https://placehold.co/50'} className="w-10 h-10 rounded-lg object-cover bg-gray-800" onError={(e) => e.currentTarget.src = "https://placehold.co/50"} />
                                  <span className="font-bold text-white">{item.dish_name}</span>
                              </div>
                          </td>
                          <td className="p-4 text-gray-400 text-sm">{item.category}</td>
                          <td className="p-4 text-white font-mono">${item.price.toFixed(2)}</td>
                          <td className="p-4 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${item.bestseller ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-700 text-gray-400'}`}>
                                  {item.bestseller ? 'Best Seller' : 'Standard'}
                              </span>
                          </td>
                          <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleOpenEdit(item)} className="p-2 bg-[#121212] rounded-lg text-blue-400 hover:bg-blue-900/30 border border-[#333] hover:border-blue-500 transition-all"><Edit2 size={16} /></button>
                                  <button onClick={() => onDelete(item.id)} className="p-2 bg-[#121212] rounded-lg text-red-400 hover:bg-red-900/30 border border-[#333] hover:border-red-500 transition-all"><Trash2 size={16} /></button>
                              </div>
                          </td>
                      </tr>
                  ))}
                  {filteredItems.length === 0 && (
                      <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">No items found</td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Item' : 'Upload an item'}>
          <MenuItemForm 
            onSubmit={handleSubmit} 
            onCancel={() => setIsModalOpen(false)} 
            initialData={editingItem} 
          />
      </Modal>
    </div>
  );
};
